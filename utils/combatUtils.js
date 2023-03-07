const { Client, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const player = require('../utils/playerUtils.js');
const inventory =  require('../utils/inventoryUtils.js');
const manager = require('../manager/combatManager.js');
const skillUtil = require('../utils/skillUtils.js');
const skillList = require('../data/skills.json');
const mobList = require('../data/monster.json');

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

    const embed = new EmbedBuilder()
        .setTitle("The tension is palpable...")
        .setDescription("When everyone is ready, the party leader can press the button below to start the combat !");

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('combat_start')
                .setLabel('Start Combat')
                .setStyle(ButtonStyle.Secondary)
        );

    await thread.send({ embeds: [embed], components: [row] });

    return thread;
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







exports.getCombatCollection = async function(threadId) {
    const combatDatabase = Client.mongoDB.db('combat-data').collection(threadId);

    const find = await combatDatabase.findOne({}, { _id: 0 });

    return new Promise(async resolve => {
        resolve(find);
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
    let combatInfo = await this.getCombatCollection(combatId);

    if (combatInfo == null) {
        console.log("[DEBUG] Attempted to modify a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

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

    if(stringSelectOptions.length == 0) {
        const skill = skillList["default"];
        stringSelectOptions.push({
            label: skill.name,
            value: "default",
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
    const combatCollection = Client.mongoDB.db('combat-data').collection(thread.id);
    let combatInfo = await this.getCombatCollection(thread.id);

    if (combatInfo == null) {
        console.log("[DEBUG] Attempted to modify a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    if(interaction.user.id != combatInfo.current_action.current_player_id) {
        //console.log(interaction.user.id);
        interaction.reply("I'm afraid it's not your turn yet...");
        return;
    }

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


    const stringSelectOptions = [];
    let i = 0;

    for (const enemy of enemyTeam) {
        if(enemy.health <= 0) continue;
        stringSelectOptions.push({
            label: enemy.id,
            value: enemy.id,
            description: "HP: " + enemy.health + " / " + enemy.stats.vitality,
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
    const combatCollection = Client.mongoDB.db('combat-data').collection(thread.id);
    let combatInfo = await this.getCombatCollection(thread.id);

    if (combatInfo == null) {
        console.log("[DEBUG] Attempted to modify a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    }

    if(interaction.user.id != combatInfo.current_action.current_player_id) {
        interaction.reply("I'm afraid it's not your turn yet...");
        return;
    }

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

exports.executeMonsterAttack = async function(combatInfo, thread, monsterId, targetId) {
    let exeData = {
        combat: combatInfo,
        thread: thread,
        casterId: monsterId,
        targetId: targetId,
    }

    let monster = exports.getPlayerInCombat(monsterId, combatInfo);
    const random = Math.floor(Math.random() * (monster.skills.length));
    console.log(random);
    exeData.skill = skillList[monster.skills[random]];

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

    for (const fighter of fighterList) {
        soonestFighter = exports.compareTimelines(soonestFighter, fighter);
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
    if (player1 == null || player1 == undefined || player1.health <= 0)
        return player2;
    if (player2 == null || player2 == undefined || player2.health <= 0)
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


exports.createMonsterData = function(combat, monster) {

    let i = 0;
    if(this.getPlayerInCombat(monster, combat) != null) {
        i++;
        while((this.getPlayerInCombat(monster + "-" + i, combat)) != null) {
            i++;
        }
    }
    

    const mobData = mobList[monster];

    const dummy = {
        type: "monster",
        timeline: 0,
        stats: {
            vitality: mobData.base_stats.vitality + Math.floor(Math.random(mobData.mod_stats.vitality)),
            strength: mobData.base_stats.strength + Math.floor(Math.random(mobData.mod_stats.strength)),
            dexterity: mobData.base_stats.dexterity + Math.floor(Math.random(mobData.mod_stats.dexterity)),
            resistance: mobData.base_stats.resistance + Math.floor(Math.random(mobData.mod_stats.resistance)),
            intelligence: mobData.base_stats.intelligence + Math.floor(Math.random(mobData.mod_stats.intelligence)),
            agility: mobData.base_stats.agility + Math.floor(Math.random(mobData.mod_stats.agility)),
        },
        equipment: {}
    }

    if(i > 0) {
        dummy.id = monster + "-" + i;
    } else {
        dummy.id = monster;
    }

    dummy.health = dummy.stats.vitality;

    // Set the skills
    dummy.skills = [];
    for (const skill of mobData.skills) {
        dummy.skills.push(skill.id);
    }


    return dummy;
}

exports.announceNewTurn = async function(thread, player) {

    const embed = new EmbedBuilder();

    if(player.type == "human") {
        embed
            .setDescription('It\'s <@' + player.id + '>\'s turn!')
            .setColor("#ffffff");
    } else {
        embed
            .setDescription('It\'s ' + player.id + '\'s turn!')
            .setColor("#ffffff");
    }
    

    thread.send({ embeds: [embed] });
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

exports.addToValueTologger = function(log, playerId, valueName, value) {
    let playerLog = this.getLogger(log, playerId);
    if(playerLog[valueName] == null || playerLog[valueName] == undefined) {
        playerLog[valueName] = 0;
    }
    playerLog[valueName] += value;
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

    if(entity.type == "human") {
        const name = Client.client.users.cache.get(entity.id).username;
        title = name;
    } else {
        title = entity.id;
    }

    //console.log(entity);

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



    if(team1Alive && !team2Alive) {
        return 1;
    } else if(team2Alive && !team1Alive) {
        return 2;
    }
    return 0;
}

exports.rewardLoot = async function(combat, thread) {
    var lootTable = [];
    var totalExp = 0;
    var totalMoney = 0;

    for(const enemy of combat.team2) {
        if(enemy.type == "monster") {
            const enemyType = enemy.id.split("-")[0];
            const enemyData = mobList[enemyType];
            lootTable.push(...enemyData.loots);
            totalExp = totalExp + enemyData.exp;
            totalMoney = totalMoney + enemyData.money;
        }   
    }
    totalExp = Math.floor(totalExp / combat.team1.length);
    totalMoney = Math.floor(totalMoney / combat.team1.length);

    for(const victor of combat.team1) {
        if(victor.type == "human") {
            const embed = new EmbedBuilder()
                .setTitle( Client.client.users.cache.get(victor.id).username + '\'s earnings!')
            player.exp.award(victor.id, totalExp);
            player.giveMoney(victor.id, totalMoney);
            embed.setDescription("You earned a total of " + totalExp + " experience points and " + totalMoney + " $ !");
            

            var lootDescription = "";

            for(const loot of lootTable) {
                inventory.giveItem(victor.id, loot.id, loot.pack );
                lootDescription += loot.id + " x" + loot.pack + "\n";
            }

            if(lootDescription != "") {
                embed.addFields({name: "Loot", value: lootDescription});
            }

            player.health.set(victor.id, victor.health);

            thread.send({ embeds: [embed] });
        }
    }

    
}

exports.updateMainMessage = function(combatInfo, message, state) {

    const embed = new EmbedBuilder()
		.setTitle('The roar of battle is heard in the distance...')
		.setTimestamp()

    const components = [];

    switch(state) {
        case "prebattle":
            embed.setDescription("A battle is about to begin! All party members can join the fight.");
            const row = new ActionRowBuilder()
		            .addComponents(
                        new ButtonBuilder()
                            .setCustomId('joinFight-' + message.id + '-1')
                            .setLabel('Join in!')
                            .setStyle(ButtonStyle.Secondary)
                    );
            if(combatInfo.team1.length > 0 || combatInfo.team2.length > 0) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('leaveFight-' + message.id + '-1')
                        .setLabel('Leave!')
                        .setStyle(ButtonStyle.Secondary)
                );
            }
            components.push(row);
            break;
        case "battle":
            embed.setDescription("Current turn: " + combatInfo.current_turn);
            break;
        case "victory":
            embed.setDescription("Our fierce warriors have won the battle!");
            break;
        case "defeat":
            embed.setDescription("Our warriors have been defeated...");
            break;
        case "cancelled":
            embed.setTitle("The gods of battle seem displeased...");
            embed.setDescription("The battle has been cancelled.");
            break;
        case "end":
            embed.setDescription("The battle has found its victor!");
        default:
            break;
    }

    let team1 = "";
    let team2 = "";

    for (const player of combatInfo.team1) {
        switch(player.type) {
            case "human":
                team1 += "<@" + player.id + "> ";
                break;
            case "monster":
            case "dummy":
                team1 += player.id + " ";
                break;
        }

        if(player.health <= 0) {
            team1 += "(KO)\n";
        } else {
            team1 += "(" + player.health + " HP)\n";
        }
    }

    for (const player of combatInfo.team2) {
        switch(player.type) {
            case "human":
                team2 += "<@" + player.id + ">";
                break;
            case "monster":
            case "dummy":
                team2 += player.id + " ";
                break;
        }

        if(player.health <= 0) {
            team2 += "(KO)\n";
        } else {
            team2 += "(" + player.health + " HP)\n";
        }
    }

    let team1Value = (team1.length > 0) ? team1 : "Waiting for players...";
    let team2Value = (team2.length > 0) ? team2 : "Waiting for players...";

    if(state != "cancelled")
        switch(combatInfo.type) {
            case "wild-encounter":
                embed.addFields({name: "Players", value: team1Value});
                if(team2.length > 0)
                    embed.addFields({name: "Monsters", value: team2Value});
                break;
            default:
                embed.addFields({name: "Team 1", value: team1Value});
                embed.addFields({name: "Team 2", value: team2Value});
                break;
        }

    message.edit({ embeds: [embed], components: components}); 
}