const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const equipSetup = require('../setup/equipSetup.js');
const playerUtils = require('./playerUtils.js');

exports.stat = {};

exports.display = async function(playerId, channel) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    const query = { name: "inventory" };
    const options = {
        projection: {equipItems: 1, equiped: 1},
        upsert: true,
    };

    const inv = await playerCollection.findOne(query, options);

    let embed = new EmbedBuilder();

    embed = await exports.getDisplay(playerId, embed, inv.equiped);

    const row = new ActionRowBuilder()
        .addComponents(
            makeButton("Equip", "equip-equip"),
            makeButton("Unequip", "equip-unequip"),
            makeButton("List"  , "equip-list"));
        
    const slider = new ActionRowBuilder()
        .addComponents(
            addSlider(playerId));


    channel.send({ embeds: [embed], components: [slider, row] });
}

function addSlider(playerId) {    
    const invSelector = new StringSelectMenuBuilder()
        .setCustomId('inventory_selector-' + playerId)
        .setPlaceholder('Nothing selected')
            .addOptions(
                [
                    {label: "Main", value: "main", description: "Display your main stats!"},
                    {label: "Items", value: "items", description: "Display every item you own!"},
                    {label: "Abilities", value: "abilities", description: "Manage your abilities!"},
                    {label: "Stats", value: "stats", description: "Get a view of your stats!"},
                    {label: "Equipment", value: "equipment", description: "Showcase your stuff!"},
                ]
        )

    return invSelector;
}


exports.get = function(chosenEquipment, type) {
    var map;

    switch (type) {
        case "weapon":
            map = equipSetup.weapons;
            break;
        case "helmet":
            map = equipSetup.helmets;
            break;
        case "chestplate":
            map = equipSetup.chestplates;
            break;
        case "boots":
            map = equipSetup.boots;
            break;
        default:
            break;
    }

    if(map.has(chosenEquipment)) {
        return map.get(chosenEquipment);
    }

    if(Array.from(map.values()).filter(equip => equip.name == chosenEquipment).length > 0) {
        return Array.from(map.values()).filter(equip => equip.name == chosenEquipment)[0];
    }

    return null;
}

exports.obtain = async function(playerId, equipId, type) {
    const equip = this.get(equipId, type);

    if(equip == null) {
        console.log("ERROR: Tried to give an equip that doesn't exist.");
        return false;
    }

    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    const query = { name: "inventory" };
    const options = { 
        projection: {equipItems: 1},
        upsert: true,
    };

    const inv = await playerCollection.findOne(query, options);

    const filter = inv.equipItems.filter(item => item.type == type);
    filter.filter(item => item.type == type);

    if(filter.length > 0) {
        console.log("DEBUG: tried to add " + equip.name + " to " + playerId + "'s inventory, but they already have one.");
        return;
    }

    equip.type = type;

    inv.equipItems.push(equip);

    const update = { $set: { equipItems: inv.equipItems }};


    playerCollection.updateOne(query, update, options);

    console.log("[DEBUG] " + equip.name + " added to " + playerId + "'s inventory.");
}

exports.trash = async function(playerId, equipId, type) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    const query = { name: "inventory" };
    const options = {
        projection: {equipItems: 1, equiped: 1},
        upsert: true,
    };

    const inv = await playerCollection.findOne(query, options);

    const equip = inv.equipItems.filter(item => item.id == equipId)[0];

    if(equip == null || equip.type != type) {
        console.log("ERROR: Tried to trash an item that the user doesn't possess.");
        return false;
    }

    if(inv.equiped[type] != null && inv.equiped[type].id == equipId) {
        console.log("ERROR: Tried to trash an item that the user is currently using.");
        return false;
    }

    inv.equipItems = inv.equipItems.filter(item => item.id != equipId);

    const update = { $set: { equipItems: inv.equipItems }};

    playerCollection.updateOne(query, update, options);

    console.log("DEBUG: " + equip.name + " trashed from " + playerId + "'s inventory.");
}

exports.equip = async function(playerId, query, type) {
    const data = await playerUtils.getData(playerId, "info");
    const inv = await playerUtils.getData(playerId, "inventory");

    inv.equipItems = inv.equipItems.filter(item => item.type == type);

    const equip = exports.leveinsteinSearch(query, inv.equipItems)[0];

    if(equip == null || equip.size == 0) {
        console.log("ERROR: Tried to equip an item that the user doesn't possess.");
        return "nopossess";
    }

    equip = equip.equip;
    if(type == undefined)
        type = equip.type;
    if(equip.type != type) {
        console.log("ERROR: Tried to equip an item that doesn't match the type.");
        return "invalidtype";
    }

    // Remove old max health
    if(inv.equiped[type] != null && inv.equiped[type].caracteristics.raw_buff_vit != undefined) {
        data.max_health -= inv.equiped[type].caracteristics.raw_buff_vit;
    }

    // Add new max health
    if(equip.caracteristics.raw_buff_vit != undefined) {
        data.max_health += equip.caracteristics.raw_buff_vit;
    }

    console.log("New max health: " + data.max_health);

    // Check if health is over max health
    if(data.health > data.max_health) {
        data.health = data.max_health;
    }

    inv.equiped[type] = equip;

    await playerUtils.updateData(playerId, {equiped: inv.equiped},  "inventory");
    await playerUtils.updateData(playerId, {max_health: data.max_health, health: data.health}, "info");

    return true;
}

exports.unequip = async function(playerId, type) {
    const data = await playerUtils.getData(playerId, "info");
    const inv = await playerUtils.getData(playerId, "inventory");

    if(inv.equiped[type] == null) {
        console.log(inv);
        console.log(type);
        console.log("ERROR: Tried to unequip an item that the user hasn't equipped.");
        return "notequip";
    }

    // Remove old max health
    if(inv.equiped[type].caracteristics.raw_buff_vit != undefined) {
        data.max_health -= inv.equiped[type].caracteristics.raw_buff_vit;
    }

    // Check if health is over max health
    if(data.health > data.max_health) {
        data.health = data.max_health;
    }

    inv.equiped[type] = null;

    await playerUtils.updateData(playerId, {equiped: inv.equiped},  "inventory");
    await playerUtils.updateData(playerId, {max_health: data.max_health, health: data.health}, "info");

    return true;
}

exports.getEquipData = function(equip) {
    if(typeof equip == "string")
        equip = equipSetup.equipmentList.filter(item => item.id == equip)[0];

    const embed = new EmbedBuilder()
        .setTitle(equip.name)
        .setDescription(equip.description)
        .setFooter({text: "ID: " + equip.id})

    if(equip.image != undefined)
        embed.setImage(equip.image);

    return embed;
}

exports.leveinsteinSearch = function(query, data) {
    const list = [];
    var minLev = 999;

    for(equip of data) {
        const levName = levenshteinDistance(query, equip.name);
        const levId = levenshteinDistance(query, equip.id);
        const lev = levName < levId ? levName : levId;
        
        list.push({lev: lev, equip: equip});

        if(lev < minLev)
            minLev = lev;
    }

    if(minLev == 0) {
        return list.filter(item => item.lev == 0).sort((a, b) => a.lev - b.lev);
    }

    minLev = minLev + 2;

    if(minLev > 1.5*(query.length))
        return [];

    return list.filter(item => item.lev < minLev).sort((a, b) => a.lev - b.lev);
}

exports.receiveButton = async function(interaction, playerId, args) {
    const message = interaction.message;

    const row = new ActionRowBuilder();
    var embed = null;

    switch (args[0]) {
        case "backmain":
            embed = new EmbedBuilder();
            embed = await exports.getDisplay(playerId, embed);
            row.addComponents(
                makeButton("Equip", "equip-equip"),
                makeButton("Unequip", "equip-unequip"),
                makeButton("List"  , "equip-list"));
            break;
        case "equip":
            row.addComponents(
                makeButton("←", "equip-backmain"),
                makeButton("Weapon"    , "equip-equipweapon"),
                makeButton("Helmet"    , "equip-equiphelmet"),
                makeButton("Chestplate", "equip-equipchestplate"),
                makeButton("Boots"     , "equip-equipboots"));
            break;
        case "unequip":
            row.addComponents(
                makeButton("←", "equip-backmain"),
                makeButton("Weapon"    , "equip-unequipweapon"),
                makeButton("Helmet"    , "equip-unequiphelmet"),
                makeButton("Chestplate", "equip-unequipchestplate"),
                makeButton("Boots"     , "equip-unequipboots"));
            break;
        case "list":
            embed = new EmbedBuilder();
            embed = await exports.getList(playerId);
            row.addComponents(
                makeButton("←", "equip-backmain"),
                makeButton("Display an equipement", "equip-display"));
            break;
        case "equipweapon":
            sendModal(interaction, playerId, "weapon", true);
            return;
        case "equiphelmet":
            sendModal(interaction, playerId, "helmet", true);
            return;
        case "equipchestplate":
            sendModal(interaction, playerId, "chestplate", true);
            return;
        case "equipboots":
            sendModal(interaction, playerId, "boots", true);
            return;
        case "unequipweapon":
            exports.unequip(playerId, "weapon").then(async result => {
                if(result == true) {
                    embed = new EmbedBuilder();
                    embed = await exports.getDisplay(playerId, embed);
                    row.addComponents(
                        makeButton("Equip", "equip-equip"),
                        makeButton("Unequip", "equip-unequip"),
                        makeButton("List"  , "equip-list"));
                } else {
                    interaction.reply({content: "You don't have a weapon equipped.", ephemeral: true});
                }});
                break;
        case "unequiphelmet":
            const result = await exports.unequip(playerId, "helmet")
            if(result == true) {
                embed = new EmbedBuilder();
                embed = await exports.getDisplay(playerId, embed);
                row.addComponents(
                    makeButton("Equip", "equip-equip"),
                    makeButton("Unequip", "equip-unequip"),
                    makeButton("List"  , "equip-list"));
            } else {
                console.log("DEBUG: " + result);
                interaction.reply({content: "You don't have a helmet equipped.", ephemeral: true});
                return;
            };
            break;
        case "unequipchestplate":
            exports.unequip(playerId, "chestplate").then(async result => {
                if(result == true) {
                    embed = new EmbedBuilder();
                    embed = await exports.getDisplay(playerId, embed);
                    row.addComponents(
                        makeButton("Equip", "equip-equip"),
                        makeButton("Unequip", "equip-unequip"),
                        makeButton("List"  , "equip-list"));
                } else {
                    interaction.reply({content: "You don't have a chestplate equipped.", ephemeral: true});
                    return;
                }});
                break;
        case "unequipboots":
            exports.unequip(playerId, "boots").then(async result => {
                if(result == true) {
                    embed = new EmbedBuilder();
                    embed = await exports.getDisplay(playerId, embed);
                    row.addComponents(
                        makeButton("Equip", "equip-equip"),
                        makeButton("Unequip", "equip-unequip"),
                        makeButton("List"  , "equip-list"));
                } else {
                    interaction.reply({content: "You don't have boots equipped.", ephemeral: true});
                    return;
                }});
                break;
        default:
            row.addComponents(
                makeButton("←", "equip-backmain"),
            );
            break;
    }



    const slider = new ActionRowBuilder()
            .addComponents(
                addSlider(playerId));

    if(row.components.length == 0)
        return;

    if(embed != null) {
        interaction.update({embeds: [embed], components: [slider, row]});
    } else {
        interaction.update({components: [slider, row]});
    }

}

exports.getList = async function (playerId) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    const query = { name: "inventory" };
    const options = {
        projection: {equipItems: 1},
        upsert: true,
    };

    const inv = await playerCollection.findOne(query, options);

    var embed = new EmbedBuilder();

    embed.setTitle("Equiment Inventory");
    embed.setColor(0x00ff00);

    console.log(inv.equipItems);

    if(Object.values(inv.equipItems).length == 0) {
        embed.setDescription("You don't have any equipements in your inventory.");
        return embed;
    }

    var items = "";

    for (var i = 0; i < Object.values(inv.equipItems).length; i++) {
        const item = Object.values(inv.equipItems)[i];
        items += Object.keys(inv.equipItems)[i] + " x" + item.quantity + "\n";
    }


    embed.setDescription(items);
    return embed;
}

    

exports.getDisplay = async function (playerId, embed, equipment) {
    if(equipment == null) {
        const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

        const query = { name: "inventory" };
        const options = {
            projection: {equipItems: 1, equiped: 1},
            upsert: true,
        };

        const inv = await playerCollection.findOne(query, options);

        equipment = inv.equiped;
    }


    if(equipment.weapon == null) {
        embed.addFields({name: "Weapon", value: "No weapon equiped."});
    } else {
        embed.addFields({name: "Weapon", value: equipment.weapon.name});
    }

    if(equipment.helmet == null) {
        embed.addFields({name: "Helmet", value: "No helmet equiped."});
    } else {
        embed.addFields({name: "Helmet", value: equipment.helmet.name});
    }

    if(equipment.chestplate == null) {
        embed.addFields({name: "Chestplate", value: "No chestplate equiped."});
    } else {
        embed.addFields({name: "Chestplate", value: equipment.chestplate.name});
    }

    if(equipment.boots == null) {
        embed.addFields({name: "Boots", value: "No boots equiped."});
    } else {
        embed.addFields({name: "Boots", value: equipment.boots.name});
    }

    return embed;
}
function makeButton(name, id) {
    return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(name)
        .setStyle(ButtonStyle.Secondary);
}

function sendModal(interaction, playerid, type, isEquip) {
    const modal = new ModalBuilder()
        .setCustomId("modal")
        .setTitle("Modal Title")

    const textInput = new TextInputBuilder()
        .setCustomId("text-input")
        .setMinLength(1)
        .setMaxLength(30)
        .setStyle(TextInputStyle.Short)
        .setLabel("This field is required")
        .setRequired(true);

    if(isEquip) {
        modal.setTitle("Equipping " + type);
        modal.setCustomId("equip-" + type);
        textInput.setPlaceholder("Enter the name of the " + type + " you want to equip.");
    } else {
        modal.setTitle("Unequipping " + type);
        modal.setCustomId("unequip-" + type);
        textInput.setPlaceholder("Enter the name of the " + type + " you want to unequip.");
    }

    const row = new ActionRowBuilder();
    row.addComponents(textInput);

    modal.addComponents(row);

    interaction.showModal(modal);
}

exports.receiveModal = async function(interaction, playerId, equip, type) {
    var result = await exports.equip(playerId, equip, type);

    switch (result) {
        case true:
            interaction.deferUpdate();
            break;
        case "invalidtype":
            interaction.reply({content: "Invalid type!", ephemeral: true});
            break;
        case "nopossess":
            interaction.reply({content: "No equipment matched your query.", ephemeral: true});
            break;
        default:
            interaction.reply({content: "Something went wrong!", ephemeral: true});
            break;
    }

    interaction.message.edit({embeds: [await exports.getDisplay(playerId, new EmbedBuilder())]});

}

exports.stat.getCombined = function(equips, stat) {
    var total = 0;

    for(var i = 0; i < Object.values(equips).length; i++) {
        var equip = Object.values(equips)[i];
        if(equip != null) {
            if(equip.caracteristics[stat] != null)
                total += equip.caracteristics[stat];
        }
    }

    return total;
}

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