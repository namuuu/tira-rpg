const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');

/**
 * Creates a thread from a message
 * @param message the message to create a thread from
 * @returns the created thread
 */
exports.createThread = async function(message) {
    const thread = await message.startThread({
        name: 'name',
        autoArchiveDuration: 60,
        reason: 'reason',
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
    if(channel.isThread()) {
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
exports.instanciateCombat = async function(message) {
    this.createThread(message);
    const messageId = message.id;
    const combatCollection = Client.mongoDB.db('combat-data').collection(messageId);

    const combatData = [
        {
            zone: null,
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
        resolve(messageId);
    });
}

exports.deleteCombat = async function(messageId) {
    const combatCollection = Client.mongoDB.db('combat-data').collection(messageId);

    return new Promise(async resolve => {
        await combatCollection.drop(function(err, res) {
            if(err) throw err;
            if(res) console.log("[DEBUG] Combat " + messageId + " deleted.");
        });
    });
}

exports.joinFight = async function(playerId, combatId, team) {
    let combatCollection = await this.getCollection(combatId);

    if(combatCollection == null) {
        console.log("[DEBUG] Attempted to join a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    } 

    combatCollection = Client.mongoDB.db('combat-data').collection(combatId);

    const info = await combatCollection.findOne({}, {_id: 0});

    playerCollection = Client.mongoDB.db('player-data').collection(playerId);
    const playerInfo = await playerCollection.findOne({name: "info"}, {_id: 0});
    const playerStats = await playerCollection.findOne({name: "stats"}, {_id: 0});
    const playerInv = await playerCollection.findOne({name: "inventory"}, {_id: 0});

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

    if(team == 1) {
        info.team1.push(player);
    } else if(team == 2) {
        info.team2.push(player);
    }

    console.log(info);

    const update = { $set: {
        current_turn: 1,
        team1: info.team1,
        team2: info.team2,
    } };

    console.log(update);

    await combatCollection.updateOne({}, update, {upsert: true});

    console.log("[DEBUG] " + playerId + " joined combat " + combatId);
}

exports.getCollection = async function(messageId) {
    const combatDatabase = Client.mongoDB.db('combat-data');

    return new Promise(async resolve => {
        combatDatabase.listCollections({name: messageId}).toArray(function(err, collections) {
            if(collections.length > 0) {
                resolve(collections[0]);
            } else {
                resolve(null);
            }
        })
    });
}