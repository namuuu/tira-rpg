const { Client, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fs = require('fs');
const player = require('../utils/playerUtils.js');
const { calculateExpToNextLevel } = require('../utils/rpgInfoUtils.js');
const skill = require('./skillUtils.js');

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
exports.giveItem = async function(playerId, item, quantity) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    // Querying the inventory in the database
    const inventory = await playerCollection.findOne(
        {name: "inventory"}, 
        {projection: {_id: 0, skills: 0, activeSkills: 0}}
    );
    
    // If the item is already in the inventory, we add the quantity to the existing one
    // Else, we create a new entry for the item
    if(inventory.items[item] != undefined) {
        inventory.items[item].quantity += quantity;
    } else {
        inventory.items = {
            ...inventory.items,
            [item]: {
                quantity: quantity
            }
        }
    }

    // Updating the inventory in the database
    const result = await playerCollection.updateOne({name: "inventory"}, { $set: { items: inventory.items } }, { upsert: true });

    console.group("[DEBUG] Item " + item + " given to player " + playerId);
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
        case "skills":
            ret = (await typeSkills(embed, playerId, player.username));
            embed = ret.embeds;
            buttons.addComponents(ret.components);
            break;
        case "stats":
            embed = (await typeStats(embed, playerId)).embed;
            break;
        case "equipment":
            embed = (await typeEquipment(embed, playerId)).embed;
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

    const percHealth = Math.round((playerInfo.health / playerStats.vitality)*100);

    embed.addFields(
        { name: 'HP', value: `${playerInfo.health}/${playerStats.vitality} (${percHealth}%)`, inline: true },
        { name: 'Level ' + playerInfo.level, value: "Exp: " + playerInfo.exp + " / " + expToNextLevel + "\n" + expBar },
        { name: 'Money', value: 'Not implemented yet', inline: true}
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

    description = description.slice(0, -1);

    embed.setDescription(description);

    return {embed: embed};
} 

exports.typeStats = typeStats;
async function typeStats(embed, playerId) {
    playerStats = await player.getData(playerId, "stats");

    console.log(playerStats);

    embed.addFields(
        {name: "Vitality", value: playerStats.vitality + " ", inline: true},
        {name: "Strength", value: playerStats.strength + " ", inline: true},
        {name: "Resistance", value: playerStats.resistance + " ", inline: true},
        {name: "Dexterity", value: playerStats.dexterity + " ", inline: true},
        {name: "Agility", value: playerStats.agility + " ", inline: true},
        {name: "Intelligence", value: playerStats.intelligence + " ", inline: true},
    );

    return {embed: embed};
}

exports.typeSkills = typeSkills;
async function typeSkills(embed, playerId, playername) {
    const playerData = await player.getData(playerId, "inventory");
    const skills = playerData.skills;
    const activeSkills = playerData.activeSkills;

    var data = JSON.parse(fs.readFileSync('./data/skills.json'));

    embed
        .setTitle(`${playername}'s Skills`)
        .setFooter({text: 'Need to get more info about a specific skill ? Type t.skill <number>'})

    try {
        embed.setDescription(skills.length != 0 ? skills.map(skill => `# ${data[skill].number} - ${data[skill].name}`).join(", ") : "No skills learned.");
    } catch (error) {
        embed.setDescription("No skills learned. (There may be an error!)");
        console.error(error);
    }

    try {
        embed.addFields({name: "Active Skills", value: skill.getStringActiveSkill(activeSkills)});
    } catch (error) {
        console.error(error);
        embed.addFields({name: "Active Skills", value: "No active skills selected. (There may be an error!)"});
    }

    return {embeds: embed, components: sendButtonChangeSkill(playerId, skills.length != 0, activeSkills.length != 0)};
}

exports.typeEquipment = typeEquipment;
async function typeEquipment(embed, playerId) {
    const playerData = await player.getData(playerId, "inventory");
    const equipment = playerData.equiped;

    if(equipment.weapon == null) {
        embed.addFields({name: "Weapon", value: "No weapon equiped."});
    } else {
        embed.addFields({name: "Weapon", value: equiped.weapon.name});
    }

    if(equipment.helmet == null) {
        embed.addFields({name: "Helmet", value: "No helmet equiped."});
    } else {
        embed.addFields({name: "Helmet", value: equiped.helmet.name});
    }

    if(equipment.chestplate == null) {
        embed.addFields({name: "Chestplate", value: "No chestplate equiped."});
    } else {
        embed.addFields({name: "Chestplate", value: equiped.chestplate.name});
    }

    if(equipment.boots == null) {
        embed.addFields({name: "Boots", value: "No boots equiped."});
    } else {
        embed.addFields({name: "Boots", value: equiped.boots.name});
    }

    return {embed: embed};
}

function sendButtonChangeSkill(userId, skillEnable, activeSkillEnable) {
    const components = [];
    components.push(
        new ButtonBuilder()
            .setCustomId("select_skill-" + userId)
            .setLabel("Select Skill")
            .setStyle("Secondary")
            .setDisabled(!skillEnable)
    )
    components.push(
        new ButtonBuilder()
            .setCustomId("unselect_skill-" + userId)
            .setLabel("Unselect Skill")
            .setStyle("Secondary")
            .setDisabled(!activeSkillEnable),
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
                    {label: "Skills", value: "skills", description: "Manage your skills!"},
                    {label: "Stats", value: "stats", description: "Get a view of your stats!"},
                    {label: "Equipment", value: "equipment", description: "Showcase your stuff!"},
                ]
        )

    return invSelector;
}