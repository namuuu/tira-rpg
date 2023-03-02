const { Client } = require('discord.js');
const commandSetup = require('../setup/commandSetup.js');
const equipSetup = require('../setup/equipSetup.js');

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

    console.log(map);
    console.log(chosenEquipment);

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

    console.log("DEBUG: " + equip.name + " added to " + playerId + "'s inventory.");
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

exports.equip = async function(playerId, equipId, type) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    const query = { name: "inventory" };
    const options = { 
        projection: {equipItems: 1, equiped: 1},
        upsert: true,
    };

    const inv = await playerCollection.findOne(query, options);

    const equip = inv.equipItems.filter(item => item.id == equipId)[0];

    if(type == undefined)
        type = equip.type;
    if(equip == null || equip.type != type) {
        console.log("ERROR: Tried to equip an item that the user doesn't possess.");
        return false;
    }

    inv.equiped[type] = equip;

    const update = { $set: { equiped: inv.equiped }};

    playerCollection.updateOne(query, update, options);
}

exports.unequip = async function(playerId, type) {
    const playerCollection = Client.mongoDB.db('player-data').collection(playerId);

    const query = { name: "inventory" };
    const options = { 
        projection: {equiped: 1},
        upsert: true,
    };

    const inv = await playerCollection.findOne(query, options);

    if(inv.equiped[type] == null) {
        console.log("ERROR: Tried to unequip an item that the user doesn't possess.");
        return false;
    }

    inv.equiped[type] = null;

    const update = { $set: { equiped: inv.equiped }};

    playerCollection.updateOne(query, update, options);
}