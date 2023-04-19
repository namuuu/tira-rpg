const { Client, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const player = require('../utils/playerUtils.js');
const classData = require('../data/classes.json');
const { calculateExpToNextLevel } = require('../utils/rpgInfoUtils.js');
const equip = require('./equipUtils.js');
const ability = require('./abilityUtils.js');

exports.getInventoryString = function(inventory) {
    let rawdata = fs.readFileSync('./data/items.json');
    let items = JSON.parse(rawdata);

    if(inventory == undefined)
        return "ERROR_UNDEFINED_INVENTORY";

    var inventoryDisplay = "";
    if(Object.keys(inventory).length != 0)
        try {
            for(const [key, value] of Object.entries(inventory)) {
                inventoryDisplay += `${items[key].name} (x${value.quantity})\n`;
            }
            return inventoryDisplay;
        } catch(err) {
            console.log(err);
            return "ERROR_UNDEFINED_ITEM";
        }
    else
        return "Vide";
}

/**
 * Adding an item to the inventory of a player or increasing the quantity of an existing item
 * @param playerId id of the player
 * @param {*} item item to give
 * @param {*} quantity quantity of the item to give
 */
exports.giveItem = async function(playerId, item, quantity, channel) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    // Querying the inventory in the database
    const inventory = await playerCollection.findOne(
        {name: "inventory"}, 
        {projection: {_id: 0, abilities: 0, activeAbilities: 0, stats: 0, equipment: 0}}
    );
    
    // If the item is already in the inventory, we add the quantity to the existing one
    // Else, we create a new entry for the item
    if(inventory.items[item] != undefined) {
        var int1 = parseInt(quantity);
        var int2 = parseInt(inventory.items[item].quantity);
        var int3 = int1 + int2;
        inventory.items[item].quantity = int3;
    } else {
        inventory.items = {
            ...inventory.items,
            [item]: {
                quantity: quantity
            }
        }
    }

    // Updating the inventory in the database
    playerCollection.updateOne({name: "inventory"}, { $set: { items: inventory.items } }, { upsert: true });

    if(channel != undefined) {
        const embed = new EmbedBuilder()
            .setDescription(`<@${playerId}> received ${quantity} ${item}!`)
            .setColor(0xFFFFFF);

        channel.send({ embeds: [embed] });
    }

    console.groupCollapsed("Item Given");
    console.log(`Given to: ${playerId}`);
    console.log(`Item: ${item}`);
    console.log(`Quantity: ${quantity}`);
    console.groupEnd();
}

exports.display = async function(player, interaction, type, ack) {
    let embed = new EmbedBuilder();
    const playerId = player.id;

    embed.setAuthor({name: "Inventory of " + player.username, iconUrl: interaction.user.avatarURL});

    const componentList = [];

    const row = new ActionRowBuilder();
    row.addComponents(addSlider(playerId));
    componentList.push(row);
    const buttons = new ActionRowBuilder();

    switch(type) {
        case "items":
            embed = (await typeItems(embed, playerId)).embed;
            break;
        case "abilities":
            ret = (await typeAbilities(embed, playerId, player.username));
            embed = ret.embed;
            buttons.addComponents(ret.components);
            break;
        case "stats":
            embed = (await typeStats(embed, playerId)).embed;
            break;
        case "equipment":
            ret = (await typeEquipment(embed, playerId, player.username));
            embed = ret.embed;
            buttons.addComponents(ret.components);
            break;
        default:
            embed = (await typeMain(embed, playerId)).embed;
            break;
    }

    try {
        if(buttons.components.length > 0)
            componentList.push(buttons);

        //console.log(buttons);

        interaction.message.edit({ embeds: [embed], components: componentList});
        if(ack)
            interaction.deferUpdate();
    } catch(err) {
        console.log(err);
    }
    
}

exports.typeMain = typeMain;
async function typeMain(embed, playerId) {
    const playerInfo = await player.getData(playerId, "info");
    const playerStats = await player.getData(playerId, "stats");
    const playerStory = await player.getData(playerId, "story");

     // Experience progress bar
     var expBar = "";
     var expToNextLevel = calculateExpToNextLevel(playerInfo.level);
     var expBarLength = Math.floor((playerInfo.exp / expToNextLevel) * 10);
     for(var i = 0; i < expBarLength; i++) {
         expBar += "▰";
     }
     for(var i = expBarLength; i < 10; i++) {
         expBar += "▱";
     }

     var energyBar = "";
     for(var i = 0; i < playerInfo.energy; i++) {
            energyBar += "▰";
    } 
    for(var i = 0; i < 3-playerInfo.energy ; i++) {
        energyBar += "▱";
    }


    const percHealth = Math.round((playerInfo.health / playerInfo.max_health)*100);

    const zone = JSON.parse(fs.readFileSync('./data/zones.json'))[playerStory.location.zone];
    if(zone == undefined)
        var zoneName = playerStory.location.zone;
    else
        var zoneName = zone.name;

    embed.addFields(
        { name: 'HP', value: `${playerInfo.health}/${playerInfo.max_health} (${percHealth}%)`, inline: true },
        { name: 'Class', value: classData[playerInfo.class].name, inline: true },
        { name: 'Level ' + playerInfo.level, value: "Exp: " + playerInfo.exp + " / " + expToNextLevel + "\n" + expBar },
        { name: 'Energy', value: energyBar },
        { name: 'Money', value: '$' + playerInfo.money, inline: true},
        { name: 'Location', value: zoneName }
    );

    return {embed: embed};
}

exports.typeItems = typeItems;
async function typeItems(embed, playerId) {
    inventory = await player.getData(playerId, "inventory");

    if(Object.keys(inventory.items).length == 0) {
        embed.setDescription("You don't have any item in your inventory.");
        return {embed: embed};
    }

    // Reading the items
    let rawdata = fs.readFileSync('./data/items.json');
    let items = JSON.parse(rawdata);

    let description = "";

    for (const [key, value] of Object.entries(inventory.items)) {
        description += `${items[key].name} (x${value.quantity}),`;
    }

    if(description == "")
        description = "Empty,";

    description = description.slice(0, -1);

    embed.setDescription(description);

    return {embed: embed};
} 

exports.typeStats = typeStats;
async function typeStats(embed, playerId) {
    playerStats = await player.getData(playerId, "stats");
    playerEquip = await player.getEquiped(playerId);

    embed.addFields(
        {name: "Vitality", value: playerStats.vitality + ` (+${equip.stat.getCombined(playerEquip, "raw_buff_vit")})`, inline: true},
        {name: "Strength", value: playerStats.strength + ` (+${equip.stat.getCombined(playerEquip, "raw_buff_str")})`, inline: true},
        {name: "Resistance", value: playerStats.resistance + ` (+${equip.stat.getCombined(playerEquip, "raw_buff_res")})`, inline: true},
        {name: "Spirit", value: playerStats.spirit + ` (+${equip.stat.getCombined(playerEquip, "raw_buff_dex")})`, inline: true},
        {name: "Agility", value: playerStats.agility + ` (+${equip.stat.getCombined(playerEquip, "raw_buff_agi")})`, inline: true},
        {name: "Intelligence", value: playerStats.intelligence + ` (+${equip.stat.getCombined(playerEquip, "raw_buff_int")})`, inline: true},
    );

    return {embed: embed};
}

exports.typeAbilities = typeAbilities;
async function typeAbilities(embed, playerId, playername) {
    var data = JSON.parse(fs.readFileSync('./data/abilities.json'));
    const playerData = await player.getData(playerId, "inventory");
    const abilities = playerData.abilities.sort((a, b) => (data[a].number > data[b].number) ? 1 : -1);
    const activeAbilities = playerData.activeAbilities.sort((a, b) => (data[a].number > data[b].number) ? 1 : -1);

    embed.setTitle(`${playername}'s Abilities`)
         .setFooter({text: 'Need to get more info about a specific ability ? Type t.ability <number>'})

    try {
        embed.setDescription(abilities.length != 0 ? abilities.map(ability => `# ${data[ability].number} - ${data[ability].name}`).join(", ") : "No ability learned.");
    } catch (error) {
        embed.setDescription("No ability learned. (There may be an error!)");
        console.error(error);
    }

    try {
        embed.addFields({name: "Active Abilities", value: ability.getStingActiveAbilities(activeAbilities)});
    } catch (error) {
        console.error(error);
        embed.addFields({name: "Active Abilities", value: "No active ability. (There may be an error!)"});
    }

    return {embed: embed, components: sendButtonAbility(playerId, abilities.length != 0, activeAbilities.length != 0)};
}

exports.typeEquipment = typeEquipment;
async function typeEquipment(embed, playerId) {
    const playerData = await player.getData(playerId, "inventory");
    const equipment = playerData.equiped;

    embed = await equip.getDisplay(playerId, embed, equipment );

    const components = [];
    components.push(
            makeButton("Equip", "equip-equip"),
            makeButton("Unequip", "equip-unequip"),
            makeButton("List"  , "equip-list"));

    return {embed: embed, components: components};
}

function sendButtonAbility(userId, abilityEnable, activeAbilityEnable) {
    const components = [];
    components.push(
        new ButtonBuilder()
            .setCustomId("selectAbility-" + userId)
            .setLabel("Select Ability")
            .setStyle("Secondary")
            .setDisabled(!abilityEnable)
    )
    components.push(
        new ButtonBuilder()
            .setCustomId("unselectAbility-" + userId)
            .setLabel("Unselect Ability")
            .setStyle("Secondary")
            .setDisabled(!activeAbilityEnable),
    );

    return components;
}

exports.addSlider = addSlider;
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

function makeButton(name, id) {
    return new ButtonBuilder()
        .setCustomId(id)
        .setLabel(name)
        .setStyle(ButtonStyle.Secondary);
}