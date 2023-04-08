const { Client, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
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
    try {
        var thread = await message.startThread({
            name: 'Combat Thread',
            autoArchiveDuration: 60,
        });
    } catch (error) {
        message.reply('There was an error trying to create a thread. Maybe there\s too many threads already ?');
        console.error(error);
        return;
    }
    

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
        channel.delete().catch(error => {});
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

exports.updateCombatCollection = async function(threadId, combat) {
    const combatDatabase = Client.mongoDB.db('combat-data').collection(threadId);

    const update = {
        $set: {
            team1: combat.team1,
            team2: combat.team2,
            current_turn: combat.current_turn,
            current_action: combat.current_action,
            current_timeline: combat.current_timeline
        }
    }

    await combatDatabase.updateOne({}, update, { upsert: true });

    return new Promise(async resolve => {
        resolve();
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

exports.updateTeamData = async function(thread, combatData, team1, team2) {
    const combatCollection = Client.mongoDB.db('combat-data').collection(thread.id);

    const update = {
        $set: {
            team1: combatData.team1,
            team2: combatData.team2,
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

    let exeData = {
        combat: combatInfo,
        thread: interaction.channel,
        casterPlayer: interaction.user,
        casterId: interaction.user.id,
        skill: skillList[skillId],
        allyTeam: exports.getPlayerAlliedTeam(interaction.user.id, combatInfo),
        enemyTeam: exports.getPlayerEnemyTeam(interaction.user.id, combatInfo),
    }

    interaction.message.delete();
    switch(skillList[skillId].aim.split('-')[0]) {
        case "self": // Aiming at self
            exeData.targets = [exports.getPlayerInCombat(interaction.user.id, combatInfo)];
            exports.executeSkill(exeData)
        break;
        case "ally":
            const remainingAllies = exeData.allyTeam.filter(player => player.health > 0 && player.id != interaction.user.id);
            if(skillList[skillId].aim.split('-')[1] == "aoe") {
                exeData.targets = remainingAllies;
                exports.executeSkill(exeData);
            } else {
                if(remainingAllies.length == 1) {
                    exeData.targets = [exeData.allyTeam[0]];
                    break;
                } 
                exports.sendTargetSelector(combatInfo, interaction.user, interaction.channel, exeData.allyTeam.filter(player => player.health > 0 && player.id != interaction.user.id));
            }
        break;
        case "ally+self":
            const remainingAlliesAndSelf = exeData.allyTeam.filter(player => player.health > 0);
            if(skillList[skillId].aim.split('-')[1] == "aoe") {
                exeData.targets = remainingAlliesAndSelf;
                exports.executeSkill(exeData);
            } else {
                if(remainingAlliesAndSelf.length == 1) {
                    exeData.targets = [remainingAlliesAndSelf[0]];
                    exports.executeSkill(exeData);
                    break;
                }
                exports.sendTargetSelector(combatInfo, interaction.user, interaction.channel, remainingAlliesAndSelf);
            }
        break;
        case "enemy":
            const remainingEnemies = exeData.enemyTeam.filter(player => player.health > 0);
            if(skillList[skillId].aim.split('-')[1] == "aoe") {
                exeData.targets = remainingEnemies;
                exports.executeSkill(exeData);
            } else {
                if(remainingEnemies.length == 1) {
                    exeData.targets = [remainingEnemies[0]];
                    exports.executeSkill(exeData);
                    break;
                }
                exports.sendTargetSelector(combatInfo, interaction.user, interaction.channel, remainingEnemies);
            }
        break;
        case "all":
            const remainingPlayers = exeData.allyTeam.concat(exeData.enemyTeam).filter(player => player.health > 0);
            if(skillList[skillId].aim.split('-')[1] == "aoe") {
                exeData.targets = remainingPlayers;
                exports.executeSkill(exeData);
            } else {
                if(remainingPlayers.length == 1) {
                    exeData.targets = [remainingPlayers[0]];
                    exports.executeSkill(exeData);
                    break;
                }
                exports.sendTargetSelector(combatInfo, interaction.user, interaction.channel, remainingPlayers);
            }
        break;
        default:

        break;
    }
}

exports.sendTargetSelector = async function(combat, player, thread, targets) {

    const options = [];

    for(const target of targets) {
        options.push({
            label: target.name,
            value: target.id,
            description: target.id,
        });
    }

    var row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('combat_target_selector')
                    .setPlaceholder('Choose a target !')
                    .addOptions(options)
            );

    const embed = new EmbedBuilder()
            .setDescription("Who do you want to target, <@" + player.id + "> ?")

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
        interaction.reply({ content: "I'm afraid it's not your turn yet...", ephemeral: true});
        return;
    }

    const exeData = {
        combat: combatInfo,
        thread: interaction.channel,
        casterPlayer: interaction.user,
        casterId: interaction.user.id,
        skill: skillList[combatInfo.current_action.skill],
        allyTeam: exports.getPlayerAlliedTeam(interaction.user.id, combatInfo),
        enemyTeam: exports.getPlayerEnemyTeam(interaction.user.id, combatInfo),
        targets: [exports.getPlayerInCombat(interaction.values[0], combatInfo)]
    }

    await combatCollection.updateOne({}, {$set: { current_action: combatInfo.current_action }}, { upsert: true });

    interaction.message.delete();

    exports.executeSkill(exeData);
}

exports.executeSkill = async function(exeData) {
    const { thread } = exeData;
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

exports.executeMonsterAttack = async function(combatInfo, thread, monsterId) {
    let exeData = {
        combat: combatInfo,
        thread: thread,
        allyTeam: exports.getPlayerAlliedTeam(monsterId, combatInfo),
        enemyTeam: exports.getPlayerEnemyTeam(monsterId, combatInfo),
        casterId: monsterId,
        caster: exports.getPlayerInCombat(monsterId, combatInfo),
    }

    let monster = exeData.caster;

    let aliveAllies = [];
    aliveAllies.push(...exeData.allyTeam.filter((e) => e.health > 0));
    let aliveEnemies = [];
    aliveEnemies.push(...exeData.enemyTeam.filter((e) => e.health > 0));

    exeData.skill = skillList[monster.skills[Math.floor(Math.random() * (monster.skills.length))]];

    switch(exeData.skill.aim.split('-')[0]) {
        case "self":
            exeData.targets = [exeData.caster];
        break;
        case "ally":
            if(exeData.skill.aim.split('-')[1] == "aoe")
                exeData.targets = aliveAllies;
            else
                exeData.targets = [aliveAllies[Math.floor(Math.random() * (aliveAllies.length))]];
        break;
        case "enemy":
            if(exeData.skill.aim.split('-')[1] == "aoe")
                exeData.targets = aliveEnemies;
            else 
                exeData.targets = [aliveEnemies[Math.floor(Math.random() * (aliveEnemies.length))]];
        break;
        case "all":
            exeData.targets = aliveEnemies.concat(aliveAllies);
        break;
        default:
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
            spirit: mobData.base_stats.spirit + Math.floor(Math.random(mobData.mod_stats.spirit)),
            resistance: mobData.base_stats.resistance + Math.floor(Math.random(mobData.mod_stats.resistance)),
            intelligence: mobData.base_stats.intelligence + Math.floor(Math.random(mobData.mod_stats.intelligence)),
            agility: mobData.base_stats.agility + Math.floor(Math.random(mobData.mod_stats.agility)),
        },
        equipment: {},
        effects: {},
    }

    if(i > 0) {
        dummy.id = monster + "-" + i;
        dummy.name = mobData.name + " (" + i + ")";
    } else {
        dummy.id = monster;
        dummy.name = mobData.name;
    }

    dummy.health = dummy.stats.vitality;

    // Set the skills
    dummy.skills = [];
    for (const skill of mobData.skills) {
        dummy.skills.push(skill.id);
    }


    return dummy;
}

exports.setInitialPassives = function(player) {
    if(player.class != undefined) {
        switch(player.class) {
            case "warrior":
                player.effects["solar-gauge"] = {
                    situation: "before",
                    value: 0,
                }
                break;
            case "ranger":
                player.effects["lunar-gauge"] = {
                    situation: "before",
                    value: 70,
            }
        }
    }
}

exports.announceNewTurn = async function(thread, player) {

    const embed = new EmbedBuilder();

    if(player.type == "human") {
        embed
            .setDescription('It\'s <@' + player.id + '>\'s turn!')
            .setColor("#ffffff");
    } else {
        embed
            .setDescription('It\'s ' + player.name + '\'s turn!')
            .setColor("#ffffff");
    }
    

    return thread.send({ embeds: [embed] });
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
    let description = "";

    for (const [effect, value] of Object.entries(log.find(player => player.id == entity.id))) {
        switch(effect) {
            case "damage":
                description += "Lost " + value + " HP (" + entity.health + " left) \n";
                break;
            case "heal":
                description += "Gained " + value + " HP (" + entity.health + " left) \n";
                break;
            case "failed":
                description += "Failed !\n";
        }
    }

    if(entity.health <= 0) {
        description += "Died\n";
        embed.addFields({name: entity.name, value: description});
        return true;
    }

    embed.addFields({name: entity.name, value: description});
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
    var lootTotal = 0;
    var totalExp = 0;
    var totalMoney = 0;

    const lootData = JSON.parse(fs.readFileSync('./data/items.json', 'utf8'));

    for(const enemy of combat.team2) {
        if(enemy.type == "monster") {
            const enemyType = enemy.id.split("-")[0];
            const enemyData = mobList[enemyType];
            lootTable.push(...enemyData.loots);
            enemyData.loots.forEach(loot => {
                lootTotal += loot.weight;
            });
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

            const lootNumber = Math.floor(Math.random() * 3) + 1;
            

            for(let i = 0; i < lootNumber; i++) {
                const lootRoll = Math.floor(Math.random() * lootTotal);
                console.log(lootRoll);
                var lootIndex = 0;
                var lootSum = 0;
                while(lootSum < lootRoll) {
                    lootSum += lootTable[lootIndex].chance;
                    lootIndex++;
                }
                const loot = lootTable[lootIndex];
                const item = lootData[loot.id];
                if(item != null && item != undefined && item.name != "none") {
                    inventory.giveItem(victor.id, loot.id, loot.pack );
                    lootDescription += item.name + " x" + loot.pack + "\n";
                }
            }

            if(lootDescription != "") {
                embed.addFields({name: "Loot", value: lootDescription});
            }

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
                team1 += player.name + " ";
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
                team2 += player.name + " ";
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

exports.displayTimeline = async function(message) {
    if(!message.channel.isThread()) {
        message.reply("Please use this command in a combat thread.").then(msg => {
            setTimeout(() => {
                message.delete();
                msg.delete();
            }, 5000);
        });
        return;
    }

    const combat = await exports.getCombatCollection(message.channel.id);

    if(combat == null) {
        message.reply("There is no combat going on in this thread.").then(msg => {
            setTimeout(() => {
                message.delete();
                msg.delete();
            }, 5000);
        });
        return;
    }

    const timelines = [];

    for(const player of combat.team1.concat(combat.team2).filter(player => player.health > 0)) {
        timelines.push({
            id: player.id,
            name: player.name,
            time: player.timeline
        })
    }

    timelines.sort((a, b) => (a.time > b.time) ? 1 : -1);

    const embed = new EmbedBuilder()
        .setTitle("Timeline")
        .setDescription("This timeline represents the turn " + combat.current_turn + " of the battle.")
        .setFooter({text: "The timeline of the battle. The first action is at the top, the last at the bottom."});

    for(const timeline of timelines) {
        console.log(timeline);
        embed.addFields({name: timeline.name, value: timeline.time + ' '});
    }

    message.reply({ embeds: [embed] });
}

exports.sendForfeit = async function(message) {

    // check if the command is used in a thread
    if(!message.channel.isThread()) {
        message.reply("Please use this command in a combat thread.").then(msg => {
            setTimeout(() => {
                message.delete();
                msg.delete();
            }, 5000);
        });
        return;
    }

    const combat = await exports.getCombatCollection(message.channel.id);

    // check if there is a combat going on in this thread
    if(combat == null) {
        message.reply("There is no combat going on in this thread.").then(msg => {
            setTimeout(() => {
                message.delete();
                msg.delete();
            }, 5000);
        });
        return;
    }

    const player = combat.team1.find(player => player.id == message.author.id);

    // check if the player is in the combat
    if(player == null) {
        message.reply("You are not in this combat.").then(msg => {
            setTimeout(() => {
                message.delete();
                msg.delete();
            }, 5000);
        });
        return;
    }

    // check if the player is already KO
    if(player.health <= 0) {
        message.reply("You are already KO.").then(msg => {
            setTimeout(() => {
                message.delete();
                msg.delete();
            }, 5000);
        });
        return;
    }

    player.health = 0;

    await exports.updateCombatCollection(message.channel.id, combat);

    exports.updateMainMessage(combat, message.channel, "battle");

    const result = exports.checkForVictory(combat)

    if(result != 0) {
        manager.callForVictory(combat, message.channel, result)
    }
}