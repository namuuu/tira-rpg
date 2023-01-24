const { Client, EmbedBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const embedUtils = require('../utils/messageTemplateUtils.js');
const manager = require('../manager/combatManager.js');
const skillUtil = require('../utils/skillUtils.js');
const skillList = require('../data/skills.json');

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
        channel.delete();

        return;
    } else {
        channel.send("It doesn't seem like a thread...");
        console.log("[DEBUG] Attempted to delete a non-thread channel. (NON_THREAD_CHANNEL_DELETE_ATTEMPT)")
    }
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

exports.sendSkillSelector = async function(player, thread) {

    const stringSelectOptions = [];

    for (const skillId of player.skills) {
        const skill = skillList[skillId];
        stringSelectOptions.push({
            label: skill.name,
            value: skillId,
            description: skill.description,
        });
    }

    //console.log(stringSelectOptions);

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('combat_skill_selector')
                .setPlaceholder('Choose a skill !')
                .addOptions(stringSelectOptions)
        );



    const embed = new EmbedBuilder()
        .setDescription("Which skill do you want to use, <@" + player.id + "> ?")

    await thread.send({ embeds: [embed], components: [row] });
}

exports.receiveSkillSelector = async function(interaction) {
    const thread = interaction.channel;
    let combatCollection = await this.getCombatCollection(thread.id);

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to modify a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(thread.id);

    const combatInfo = await combatCollection.findOne({}, { _id: 0 });

    const skillId = interaction.values[0];

    combatInfo.current_action.skill = skillId;

    const update = {
        $set: {
            current_action: combatInfo.current_action,
        }
    };

    await combatCollection.updateOne({}, update, { upsert: true });

    interaction.message.delete();

    if(combatInfo.current_action.aim_at == null || combatInfo.current_action.aim_at == undefined) {
        this.sendTargetSelector(combatInfo, interaction.user, interaction.channel);
    } else {
        // EXECUTE SKILL
        this.executeSkill(combatInfo, interaction.channel, combatInfo.current_action.skill, interaction.user.id, combatInfo.current_action.aim_at);
    }
}

exports.sendTargetSelector = async function(combat, player, thread) {
    const enemyTeam = this.getPlayerEnemyTeam(player.id, combat);

    //console.log(enemyTeam);

    const stringSelectOptions = [];
    let i = 0;

    for (const enemy of enemyTeam) {
        stringSelectOptions.push({
            label: enemy.id,
            value: enemy.id,
            description: "HP: " + enemy.health + " / " + enemy.stats.vitality,
            //description: enemy.health + " / " + enemy.stats.vitality + " HP",
        });
        i = i + 1;
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('combat_target_selector')
                .setPlaceholder('Choose a target !')
                .addOptions(stringSelectOptions)
        );

    const embed = new EmbedBuilder()
        .setDescription("Who do you want to attack, <@" + player.id + "> ?")

    await thread.send({ embeds: [embed], components: [row] });
}

exports.receiveTargetSelector = async function(interaction) {
    const thread = interaction.channel;
    let combatCollection = await this.getCombatCollection(thread.id);

    if (combatCollection == null) {
        console.log("[DEBUG] Attempted to modify a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    combatCollection = Client.mongoDB.db('combat-data').collection(thread.id);

    const combatInfo = await combatCollection.findOne({}, { _id: 0 });

    const targetId = interaction.values[0];

    combatInfo.current_action.aim_at = targetId;

    const update = {
        $set: {
            current_action: combatInfo.current_action,
        }
    };

    await combatCollection.updateOne({}, update, { upsert: true });

    interaction.message.delete();

    if(combatInfo.current_action.skill == null || combatInfo.current_action.skill == undefined) {
        const playerTeam = (combatInfo.current_action.current_player_team == 1) ? combatInfo.team2 : combatInfo.team1;
        for (const player of playerTeam) {
            //console.log(player);
            if(player.id == interaction.user.id) {
                this.sendSkillSelector(player, interaction.channel);
            }
        }
    } else {
        // EXECUTE SKILL
        this.executeSkill(combatInfo, interaction.channel, combatInfo.current_action.skill, interaction.user.id, combatInfo.current_action.aim_at);
    }
}

exports.executeSkill = async function(combatInfo, thread, skillId, casterId, targetId) {
    let exeData = {
        combat: combatInfo,
        thread: thread,
        casterId: casterId,
        targetId: targetId,
        skill: skillList[skillId],
    }

    //console.log(exeData);

    let log = skillUtil.execute(exeData);

    combatCollection = Client.mongoDB.db('combat-data').collection(thread.id);

    const update = {
        $set: {
            team1: exeData.combat.team1,
            team2: exeData.combat.team2,
        }
    };

    await combatCollection.updateOne({}, update, { upsert: true });

    manager.finishTurn(exeData, log);
}

exports.getSoonestTimelineEntity = function(combatInfo) {

    var soonestFighter;

    var fighterList = combatInfo.team1.concat(combatInfo.team2);

    //console.log(combatInfo);

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

exports.getPlayerInCombat = function(playerId, combat) {
    if(combat.team1.find(player => player.id == playerId) != null) {
        return combat.team1.find(player => player.id == playerId);
    } else if(combat.team2.find(player => player.id == playerId) != null) {
        return combat.team2.find(player => player.id == playerId);
    }
    return null;
}

exports.setPlayerInCombat = function(playerId, combat, player) {
    if(combat.team1.find(player => player.id == playerId) != null) {
        combat.team1.find(player => player.id == playerId) = player;
        return true;
    } else if(combat.team2.find(player => player.id == playerId) != null) {
        combat.team2.find(player => player.id == playerId) = player;
        return true;
    }
    return false;
}

exports.getPlayerAlliedTeam = function(playerId, combat) {
    if(combat.team1.find(player => player.id == playerId) != null) {
        return combat.team1;
    } else if(combat.team2.find(player => player.id == playerId) != null) {
        return combat.team2;
    }
    return null;
}

exports.getPlayerEnemyTeam = function(playerId, combat) {
    if(combat.team1.find(player => player.id == playerId) != null) {
        return combat.team2;
    } else if(combat.team2.find(player => player.id == playerId) != null) {
        return combat.team1;
    }
    return null;
}

exports.getLogger = function(log, playerId) {
    let playerLog = log.find(player => player.id == playerId);
    if(playerLog == null || playerLog == undefined) {
        playerLog = {
            id: playerId,
        };
        log.push(playerLog);
    }
    return playerLog;
}

/**
 * Logs the effects an entity suffered into an embed (in argument).
 * @param {*} embed the embed to log to (it adds a field)
 * @param {*} log the list that logs
 * @param {*} entity the entity that suffered the effects and is being logged
 * @returns true if the entity died, false otherwise
 */
exports.logResults = function(embed, log, entity) {
    let title = "";
    let description = "";

    if(entity.type == "player") {
        title = "<@" + entity.id + ">";
    } else {
        title = entity.id;
    }

    console.log(entity);

    for (const [effect, value] of Object.entries(log.find(player => player.id == entity.id))) {
        switch(effect) {
            case "damage":
                description += "Lost " + value + " HP (" + entity.health + " left) \n";
                break;
        }
    }

    if(entity.health <= 0) {
        description += "Died\n";
        embed.addFields({name: title, value: description});
        return true;
    }

    embed.addFields({name: title, value: description});
    return false;
}

exports.checkForVictory = function(combat) {
    let team1Alive = false;
    let team2Alive = false;

    for (const player of combat.team1) {
        if(player.health > 0) {
            team1Alive = true;
        }
    }

    for (const player of combat.team2) {
        if(player.health > 0) {
            team2Alive = true;
        }
    }

    if(team1Alive) {
        return 1;
    } else if(team2Alive) {
        return 2;
    }
    return 0;
}


