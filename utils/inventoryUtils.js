const { Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');

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

exports.displayInventory = async function(playerId, interaction) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    // Querying the inventory in the database
    const inventory = await playerCollection.findOne(
        {name: "inventory"}, 
        {projection: {_id: 0, skills: 0, activeSkills: 0}}
    );

    // Reading the items
    let rawdata = fs.readFileSync('./data/items.json');
    let items = JSON.parse(rawdata);
    console.log(items);

    // Creating the embed
    const embed = new EmbedBuilder()
        .setTitle("Inventory")
        .setColor(0x00FF00)
        .setFooter({text: "Inventory of " + playerId});

    let description = "";

    for (const [key, value] of Object.entries(inventory.items)) {
        description += `${items[key].name} (x${value.quantity})\n`;
    }

    embed.setDescription(description);

    // Sending the embed
    interaction.reply({ embeds: [embed], ephemeral: true });
    //interaction.reply("Not implemented yet.");
}