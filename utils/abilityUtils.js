const abilityEffect = require("../setup/abilitySetup.js");
const abilities = require("../data/abilities.json");
const fs = require('fs');
const { Client, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const player = require('./playerUtils.js');
const inv = require("./inventoryUtils.js");


exports.execute = function(data) {
    const abilityEffectList = data.ability["effects"];

    // Apply the attack's effects
    for(const effect of Object.entries(abilityEffectList)) {
        if(typeof effect[1] == 'object') {
            abilityEffect.map.get(effect[0])(data, effect);
            continue;   
        }
        abilityEffect.map.get(effect[0])(data, effect[1]); 
    }
    
    return;
}

exports.searchAbility = function(query) {
    if(!isNaN(query)) {
        // The string contains a number
        for(const ability in abilities) {
            if (abilities[ability].number == query)
                return {name: ability, ability: abilities[ability]};
        }
        return null;
    } else {
        var minDist = 3;
        var minAbility = null;
        query = query.toLowerCase();

        // The string does not contain a number
        for(const [id, ability] of Object.entries(abilities)) {
            const distance = levenshteinDistance(ability.name.toLocaleLowerCase(), query);
            if(ability == query)
                return abilities[ability];
            if(distance < minDist) {
                minDist = distance;
                minAbility = id;
            }
        }
    }

    if(minAbility == null) {
        return null;
    }

    return {name: minAbility, ability: abilities[minAbility]};
}

exports.displayAbility = function(ability) {
    return new EmbedBuilder()
        .setTitle(`#${ability.number} - ${ability.name}`)
        .setDescription(`${ability.description}`)
        .setColor(0x0099FF)
    
}

exports.learnAbility = async function(id, abilityId)  {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.abilities.includes(abilityId)) {
        console.log("[DEBUG] Ability " + abilityId + " already exists for user " + id + ".");
        return false;
    } else {
        const newItems = inventory.abilities.concat(abilityId);
        const update = { $set: { abilities: newItems } };
        options = { upsert: true };
        const result = await playerCollection.updateOne(query, update, options);
        console.log("[DEBUG] User " + id + " learned ability " + abilityId + ".");
        return true;
    }
}

exports.unlearnAbility = async function(userId, abilityId) {
    const playerCollection = Client.mongoDB.db('player-data').collection(userId);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.abilities.includes(abilityId)) {
        const newItems = [...(inventory.abilities)];
        const removeIndex = newItems.indexOf(abilityId);
        if(removeIndex > -1)
            newItems.splice(removeIndex, 1);
        const update = { $set: { abilities: newItems } };
        options = { upsert: true };
        const result = await playerCollection.updateOne(query, update, options);
        console.log("[DEBUG] User " + userId + " forgot ability " + abilityId + ".");
    } else {
        console.error("[DEBUG] Ability " + abilityId + " hasn't been learned by user " + userId + ". (UNLEARN_ABILITY_MISSING)");
    }
}

exports.hasAbility = async function(userId, abilityId) {
    const playerCollection = Client.mongoDB.db('player-data').collection(userId);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.abilities.includes(abilityId)) {
        return true;
    } else  {
        return false;
    }
}

exports.selectActiveAbility = async function(user_id, query) {
    const playerCollection = Client.mongoDB.db('player-data').collection(user_id);

    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const ability = exports.searchAbility(query);

    const abilityId = ((ability == null || ability == undefined) ? null : ability.name);
                                
    const inventory = await playerCollection.findOne({ name: "inventory" }, options);
    
    if(!inventory.abilities.includes(abilityId)) {
        console.error("[DEBUG] Ability " + abilityId + " hasn't been learned by user " + user_id + ". (ACTIVE_ABILITY_NOT_LEARNED)");
        return "not_learned";
    }
    if(inventory.activeAbilities.length >= 4) {
        console.error("[DEBUG] 4 Active Abilities already used by user " + user_id + ". (ACTIVE_ABILITY_MAX_SIZE)");
        return "max_size";
    }
    if(inventory.activeAbilities.includes(abilityId)) {
        console.error("[DEBUG] Ability " + abilityId + " already selected active by " + user_id + ". (ACTIVE_ABILITY_ALREADY_ACTIVE)");
        return "already_active";
    }

    const newItems = inventory.activeAbilities.concat(abilityId);
    const update = { $set: { activeAbilities: newItems } };
    options = { upsert: true };
    await playerCollection.updateOne({ name: "inventory" }, update, options);
    console.log("[DEBUG] User " + user_id + " selected ability " + abilityId + ".");
    return ability;
}

exports.unselectActiveAbility = async function(user_id, query) {
    const playerCollection = Client.mongoDB.db('player-data').collection(user_id);

    const ability = exports.searchAbility(query);
    const abilityId = ((ability == null || ability == undefined) ? null : ability.name);

    const inventory = await playerCollection.findOne({ name: "inventory" }, {projection: {_id: 0, items: 0, quantity: 0}});

    if(!inventory.activeAbilities.includes(abilityId)) {
        console.error("[DEBUG] Ability " + abilityId + " hasn't been selected by user " + user_id + ". (ACTIVE_ABILITY_NOT_ACTIVE)");
        return "not_selected";
    }
    
    const newItems = [...(inventory.activeAbilities)];
    const removeIndex = newItems.indexOf(abilityId);
    if(removeIndex > -1)
        newItems.splice(removeIndex, 1);
    const update = { $set: { activeAbilities: newItems } };
    options = { upsert: true };

    await playerCollection.updateOne({ name: "inventory" }, update, {projection: {_id: 0, items: 0, quantity: 0}});
    console.log("[DEBUG] User " + user_id + " unselected ability " + abilityId + ".");

    return ability;
}

function getStringActiveAbilities(abilities) {
    var data = JSON.parse(fs.readFileSync('./data/abilities.json'));
    var string = "";

    if(abilities.length != 0)
        for(const ability of abilities) {
            string += `# ${data[ability].number} - ${data[ability].name}\n`;
        }
    else
        string = "No active abilities.";

    return string;
}

async function sendStringAllAbilities(username, userId) {
    const playerData = await player.getData(userId, "inventory");
    const abilities = playerData.abilities;
    const activeAbilities = playerData.abilities;

    var data = JSON.parse(fs.readFileSync('./data/abilities.json'));

    const embed = new EmbedBuilder()
        .setTitle(`${username}'s Abilities`)
        .setFooter({text: 'Need to get more info about a specific ability ? Type t.ability <number>'})

    try {
        embed.setDescription(abilities.length != 0 ? abilities.map(ability => `# ${data[ability].number} - ${data[ability].name}`).join(", ") : "No ability learned.");
    } catch (error) {
        embed.setDescription("No abilities learned. (There may be an error!)");
        console.error(error);
    }

    try {
        embed.addFields({name: "Active Abilities", value: getStringActiveAbilities(activeAbilities)});
    } catch (error) {
        console.error(error);
        embed.addFields({name: "Active Abilities", value: "No active ability. (There may be an error!)"});
    }

    return {embeds: [embed], components: [sendButtonChangeAbility(userId, abilities.length != 0, activeAbilities.length != 0)]};
}

function sendButtonChangeAbility(userId, abilityEnable, activeAbilityEnable) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("selectAbility-" + userId)
                .setLabel("Select Ability")
                .setStyle("Secondary")
                .setDisabled(!abilityEnable),
            new ButtonBuilder()
                .setCustomId("unselectAbility-" + userId)
                .setLabel("Unselect Ability")
                .setStyle("Secondary")
                .setDisabled(!activeAbilityEnable),
        );

    return row;
}

exports.sendModal = function(interaction, select, userId) {
    if(interaction.user.id != userId) {
        interaction.reply({content: "This is not your inventory! If you need to, type `t.display`.", ephemeral: true});
        return;
    }

    const modal = new ModalBuilder()
        .setTitle("Ability Menu")
    
    const abilityInput = new TextInputBuilder()
        .setCustomId("abilityInput")
        .setPlaceholder("Ex: 155 or 'fireball'")
        .setMinLength(1)
        .setMaxLength(20)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    if(select == true) {
        modal.setCustomId("selectAbility")
        abilityInput.setLabel("Indicate the ability you want to use.")
    } else {
        modal.setCustomId("unselectAbility")
        abilityInput.setLabel("Indicate the ability you want to unselect.")
    }

    modal.addComponents(new ActionRowBuilder().addComponents(abilityInput));

    interaction.showModal(modal);
}

exports.receiveModal = async function(interaction, select) {
    const ability = interaction.fields.getTextInputValue("abilityInput");
    const userId = interaction.user.id;
    var ret;

    if(select == true)
        ret = await exports.selectActiveAbility(userId, ability);
    else
        ret = await exports.unselectActiveAbility(userId, ability);
    
    if(typeof ret != "string") {
        inv.display(interaction.user, interaction, "abilities", false);
        interaction.deferUpdate();
    } else {
        switch(ret) {
            case "not_learned":
                interaction.reply({content: "You haven't learned this ability yet!", ephemeral: true});
                break;
            case "max_size":
                interaction.reply({content: "You have already selected 4 abilities!", ephemeral: true});
                break;
            case "already_active":
                interaction.reply({content: "This ability is already active!", ephemeral: true});
                break;
            case "not_selected":
                interaction.reply({content: "This ability is not currently active!", ephemeral: true});
                break;
            default:
                interaction.reply({content: "This action doesn't seem right.", ephemeral: true});
        }
    }
}

exports.sendStringAllAbilities = sendStringAllAbilities;
exports.getStingActiveAbilities = getStringActiveAbilities;

const levenshteinDistance = (str1 = '', str2 = '') => {
    const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
       track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
       track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
       for (let i = 1; i <= str1.length; i += 1) {
          const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
          track[j][i] = Math.min(
             track[j][i - 1] + 1, // deletion
             track[j - 1][i] + 1, // insertion
             track[j - 1][i - 1] + indicator, // substitution
          );
       }
    }
    return track[str2.length][str1.length];
  };