const { Client, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const embedUtils = require('../utils/messageTemplateUtils.js');

/**
 * Creates a thread from a message
 * @param message the message to create a thread from
 * @returns the created thread
 */
exports.createThread = async function(message) {
    const thread = await message.startThread({
        name: 'Combat Thread',
        autoArchiveDuration: 60,
    });

    return new Promise(async resolve => {
        resolve(thread);
    });
}

/**
 * Deletes a thread (note: only works if the channel the command is called in is a thread)
 * @param channel the thread to delete
 */
exports.deleteThread = async function(channel) {
    if (channel.isThread()) {
        this.deleteCombat(channel.id);
        channel.delete();

        return;
    } else {
        channel.send("It doesn't seem like a thread...");
        console.log("[DEBUG] Attempted to delete a non-thread channel. (NON_THREAD_CHANNEL_DELETE_ATTEMPT)")
    }
}

/**
 * Instanciates a combat in the database, note that the data is currently blank.
 * @param message message whose id will serve as the combat id. also is the id of the thread.
 * @returns the id in question.
 */
exports.instanciateCombat = async function(channel) {
    const message = await channel.send("*Loading combat...*");
    this.createThread(message);
    const messageId = message.id;
    const combatCollection = Client.mongoDB.db('combat-data').collection(messageId);

    const combatData = [
        {
            zone: null,
            type: 'wild-encounter',
            current_turn: 0,
            current_timeline: 0,
            current_action: {
                current_player_id: null,
                aim_at: null,
                skill: null,
            },
            team1: [],
            team2: [],
        }
    ];

    const options = { ordered: true };


    return new Promise(async resolve => {
        const result = await combatCollection.insertMany(combatData, options)

        await embedUtils.sendEncounterMessage(message, 'wild-encounter');

        resolve(messageId);
    });
}

exports.deleteCombat = async function(messageId) {
    const combatCollection = Client.mongoDB.db('combat-data').collection(messageId);

    return new Promise(async resolve => {
        await combatCollection.drop(function(err, res) {
            if (err) throw err;
            if (res) console.log("[DEBUG] Combat " + messageId + " deleted.");
        });
    });
}

exports.joinFight = async function(playerId, combatId, team, message) {
    let combatCollection = await this.getCombatCollection(combatId);

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to join a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(combatId);

    const info = await combatCollection.findOne({}, { _id: 0 });

    playerCollection = Client.mongoDB.db('player-data').collection(playerId);
    const playerInfo = await playerCollection.findOne({ name: "info" }, { _id: 0 });
    const playerStats = await playerCollection.findOne({ name: "stats" }, { _id: 0 });
    const playerInv = await playerCollection.findOne({ name: "inventory" }, { _id: 0 });

    const player = {
        id: playerId,
        type: "human",
        class: playerInfo.class,
        health: playerInfo.health,
        timeline: 0,
        stats: {
            vitality: playerStats.vitality,
            strength: playerStats.strength,
            dexterity: playerStats.dexterity,
            resistance: playerStats.resistance,
            intelligence: playerStats.intelligence,
            agility: playerStats.agility,
        },
        equipment: {},
        skills: playerInv.skills,
        items: playerInv.items,
    }

    if (team == 1) {
        info.team1.push(player);
    } else if (team == 2) {
        info.team2.push(player);
    }

    console.log(info);

    const update = {
        $set: {
            current_turn: 1,
            team1: info.team1,
            team2: info.team2,
        }
    };

    const messageEmbed = message.embeds[0];

    if (team == 1) {
        if(messageEmbed.fields[0].value == "Waiting for players...") 
            messageEmbed.fields[0].value = playerId;
        else
            messageEmbed.fields[0].value += ", " + playerId + " ";
    } else if (team == 2) {
        if(messageEmbed.fields.length == 1) {
            messageEmbed.addField("Team 2", playerId + " ");
        } else {
            messageEmbed.fields[1].value += playerId + " ";
        }
    }

    message.edit({ embeds: [messageEmbed]});

    await combatCollection.updateOne({}, update, { upsert: true });

    console.log("[DEBUG] " + playerId + " joined combat " + combatId);
}

exports.getCombatCollection = async function(messageId) {
    const combatDatabase = Client.mongoDB.db('combat-data');

    return new Promise(async resolve => {
        combatDatabase.listCollections({ name: messageId }).toArray(function(err, collections) {
            if (collections.length > 0) {
                resolve(collections[0]);
            } else {
                resolve(null);
            }
        })
    });
}

/**
 * adds time to a player's timeline
 * @param {*} combatId the combat concerned
 * @param {*} playerId the id of the player to add the timeline to
 * @param {*} time the time to be added onto the player's timeline
 * @returns 
 */
exports.addTimeline = async function(combatId, playerId, time) {
    let combatCollection = await this.getCombatCollection(combatId);

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to modify a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(combatId);

    const combatInfo = await combatCollection.findOne({}, { _id: 0 });

    var fighterList = combatInfo.team1.concat(combatInfo.team2);

    for (const fighter of fighterList) {
        if (fighter.id == playerId) {
            fighter.timeline += time;
        }
    }

    const update = {
        $set: {
            team1: combatInfo.team1,
            team2: combatInfo.team2,
        }
    };

    await combatCollection.updateOne({}, update, { upsert: true });
}

exports.getSoonestTimelineEntity = async function(combatId) {
    let combatCollection = await this.getCombatCollection(combatId);

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to get a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(combatId);

    const combatInfo = await combatCollection.findOne({}, { _id: 0 });

    //console.log(combatInfo);

    var soonestFighter;

    var fighterList = combatInfo.team1.concat(combatInfo.team2);

    console.log(fighterList);

    for (const fighter of fighterList) {
        //console.log(fighter);
        soonestFighter = this.compareTimelines(soonestFighter, fighter);
    }

    return soonestFighter;
}

/**
 * Compares the relative timeline position of 2 players.
 * @param player1 
 * @param player2 
 * @returns the fastest player. or the player who exists if one is not defined.
 */
exports.compareTimelines = function(player1, player2) {
    if (player1 == null || player1 == undefined)
        return player2;
    if (player2 == null || player2 == undefined)
        return player1;

    if (player1.timeline < player2.timeline)
        return player1;
    else if (player1.timeline > player2.timeline)
        return player2;

    return player1;
}
