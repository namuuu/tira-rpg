const { Client } = require('discord.js');

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