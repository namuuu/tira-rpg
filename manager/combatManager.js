const { Client, EmbedBuilder } = require('discord.js');
const util = require('../utils/combatUtils.js');
const embed = require('../utils/messageTemplateUtils.js');

/**
 * Instanciates a combat in the database, note that the data is currently blank.
 * @param message message whose id will serve as the combat id. also is the id of the thread.
 * @returns the id in question.
 */
exports.instanciateCombat = async function(orderMessage) {
    const channel = orderMessage.channel;

    if(channel.isThread()) {
        console.log("[ERROR] Tried to instanciate a combat in a thread channel.");
        orderMessage.reply("You can't instanciate a combat in a thread channel.").then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
        return;
    }

    const message = await channel.send("*Loading combat...*");

    util.createThread(message);

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
                current_player_team: null,
                aim_at: null,
                skill: null,
            },
            team1: [],
            team2: [],
        }
    ];

    await combatCollection.insertMany(combatData, { ordered: true});
    await embed.sendEncounterMessage(message, 'wild-encounter');

    return messageId;
}

exports.deleteCombat = async function(channel) {
    const combatCollection = Client.mongoDB.db('combat-data').collection(channel.id);
    const combatData = await util.getCombatCollection(channel.id);

    util.updateMainMessage(combatData, await channel.fetchStarterMessage(), "cancelled");

    util.deleteThread(channel);

    await combatCollection.drop(function(err, res) {
        if (err) throw err;
        if (res) console.log("[DEBUG] Combat " + channel.id + " deleted.");
    });
}

exports.addPlayerToCombat = async function(playerId, combatId, team, interaction) {
    let message = interaction.message;
    let combatCollection = await util.getCombatCollection(combatId);

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to join a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }
    if(team != 1 && team != 2) {
        console.log("[DEBUG] Attempted to join a non-existent team. (NON_EXISTENT_TEAM_JOIN_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(combatId);

    const info = await combatCollection.findOne({}, { _id: 0 });

    if(util.getPlayerInCombat(playerId, info) != null) {
        console.log("[DEBUG] Attempted to join a combat with an already existing player. (ALREADY_EXISTING_PLAYER_JOIN_ATTEMPT)");
        interaction.reply({ content:"You're already in this combat!", ephemeral: true});
        return;
    }

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
        skills: playerInv.activeSkills,
        items: playerInv.items,
    }

    if (team == 1) {
        info.team1.push(player);
    } else if (team == 2) {
        info.team2.push(player);
    }

    //console.log(info);

    const update = {
        $set: {
            current_turn: 1,
            team1: info.team1,
            team2: info.team2,
        }
    };

    util.updateMainMessage(info, message, "prebattle");

    await combatCollection.updateOne({}, update, { upsert: true });

    interaction.reply({ content: 'You have joined the combat!', ephemeral: true });
    console.log("[DEBUG] " + playerId + " joined combat " + combatId);
}

exports.addDummyEntityToCombat = async function(thread) {
    let combatId = thread.id;
    let combatCollection = await util.getCombatCollection(combatId);
    let originMessage = await thread.fetchStarterMessage();

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to join a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(combatId);

    const info = await combatCollection.findOne({}, { _id: 0 });

    let i = 0;
    while((player = util.getPlayerInCombat("dummy-" + i, info)) != null) {
        i++;
    }

    const dummy = {
        id: "dummy-" + i,
        type: "dummy",
        class: "dummy",
        health: 100,
        timeline: 0,
        stats: {
            vitality: 100,
            strength: 100,
            dexterity: 100,
            resistance: 100,
            intelligence: 100,
            agility: 100,
        },
        equipment: {},
        skills: ["default"],
        items: [],
    }

    info.team2.push(dummy);

    const update = {
        $set: {
            current_turn: 1,
            team2: info.team2,
        }
    };

    // Modifying the main embed to represent the players
    util.updateMainMessage(info, originMessage, "prebattle");

    await combatCollection.updateOne({}, update, { upsert: true });

    console.log("[DEBUG] Dummy joined combat " + combatId); 
}

exports.startCombat = async function(thread) {
    let combatId = thread.id;
    let combatCollection = await util.getCombatCollection(combatId);

    if(!thread.isThread()) {
        console.log("[DEBUG] Attempted to start a non-thread channel. (NON_THREAD_CHANNEL_START_ATTEMPT)");
        return;
    }

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to start a non-existent combat. (NON_EXISTENT_COMBAT_START_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(combatId);

    const combatData = await combatCollection.findOne({}, { _id: 0 });

    if (combatData.team1.length == 0 || combatData.team2.length == 0) {
        console.log("[DEBUG] Attempted to start a combat with less than 2 players. (COMBAT_WITH_LESS_THAN_2_PLAYERS_START_ATTEMPT)");
        return;
    }

    this.combatLoop(thread, combatData);
}

exports.combatLoop = async function(thread, combatData) {
    const soonestFighter = util.getSoonestTimelineEntity(combatData);

    await util.announceNewTurn(thread, soonestFighter);

    if(soonestFighter.type == "human") {
        combatData.current_action.current_player_id = soonestFighter.id;
        combatData.current_action.aim_at = null;
        combatData.current_action.skill = null;
        util.sendSkillSelector(soonestFighter, thread);
        console.log("[DEBUG] This is the player's turn. Waiting for player input.");
    } else {
        console.log("[DEBUG] This is the monster's turn. Simulating a turn.");
        util.executeSkill(combatData, thread, "default", soonestFighter.id, combatData.team1[0].id);
    }

    combatData.current_turn++;

    const update = {
        $set: {
            current_turn: combatData.current_turn,
            current_action: combatData.current_action,
        }
    };
    
    const startMessage = await thread.fetchStarterMessage();
    util.updateMainMessage(combatData, startMessage, "battle");

    combatCollection = Client.mongoDB.db('combat-data').collection(thread.id);

    await combatCollection.updateOne({}, update, { upsert: true });
}

exports.finishTurn = async function(exeData, log) {
    const { combat, thread, casterId, targetId, skill } = exeData;
    const caster = util.getPlayerInCombat(casterId, combat);
    const target = util.getPlayerInCombat(targetId, combat);
    let embed = new EmbedBuilder();
    let casterName = caster.type == "human" ? "<@" + caster.id + ">" : caster.id;
    let targetName = target.type == "human" ? "<@" + target.id + ">" : target.id;
    
    embed.setDescription(casterName + " used " + skill.name + " on " + targetName + " !");

    let hasDied = false;

    for(player of log) {
        if(util.logResults(embed, log, util.getPlayerInCombat(player.id, combat)) == true) {
            hasDied = true;
        }
    }

    thread.send({ embeds: [embed] });

    if(hasDied) {
        const alive = util.checkForVictory(combat);
        if(alive != 0) {
            this.callForVictory(combat, thread, alive);
            return;
        }
    } 
    this.combatLoop(thread, combat);
}

exports.callForVictory = async function(combat, thread, victor) {
    switch(combat.type) {
        case "wild-encounter":
            if(victor == 1) {
                util.updateMainMessage(combat, await thread.fetchStarterMessage(), "victory");
            } else {
                util.updateMainMessage(combat, await thread.fetchStarterMessage(), "defeat");
            }
            break;
        case "pvp":
            util.updateMainMessage(combat, await thread.fetchStarterMessage(), "end");
            break;
    }


    thread.send("The combat is over !").then((message) => {
        message.react("🎉");
        setTimeout(() => thread.setLocked(true), 5000);
    });
}