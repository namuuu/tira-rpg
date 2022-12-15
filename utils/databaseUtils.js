const { Client } = require('discord.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const classes = require('../data/classes.json');

// Player data management

exports.doesPlayerExists = async function(id) {
    const playerDatabase = Client.mongoDB.db('player-data');

    return new Promise( resolve => { 
        playerDatabase.listCollections({name: id}).toArray(function(err, collections) {
            if(collections.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    });
}

exports.createPlayer = async function(id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const data = [
        { name: "info", class: "noclass", level: 0, exp: 0 },
        { name: "stats", strength: 0, vitality: 0, resistance: 0, dexterity: 0, agility: 0, intelligence: 0 },
        { name: "inventory", items: [], quantity: [] },
    ]

    const options = { ordered: true };
    
    const result = await playerCollection.insertMany(data, options);
    console.log("[DEBUG] User ID " + id + " created.");
}

exports.removePlayer = async function(id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const result = await playerCollection.drop();
    console.log("[DEBUG] User ID " + id + " removed.");
}

exports.getPlayerData = async function(id, name) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: name };
    const options = { 
        projection: {_id: 0},
    };

    const result = await playerCollection.findOne(query, options);
    
    return result;
}

exports.awardExp = async function(id, exp, channel) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "info" };
    let options = { 
        projection: {_id: 0},
    };

    const info = await playerCollection.findOne(query, options);
    const newExp = info.exp + exp;
    const newLevel = rpgInfoUtils.calculateNewLevelExp(info.level, newExp);
    
    const update = { $set: { exp: newLevel.exp, level: newLevel.level } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);

    for(let i=info.level+1; i<=newLevel.level; i++) {
        exports.getNewLevelRewards(id, i, channel);
    }
}

exports.getNewLevelRewards = async function(id, level, channel) {
    if(!channel)
        return;
    channel.send("Vous avez atteint le niveau " + level + " !");
}

exports.giveItem = async function(id, item, quantity) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.items.includes(item)) {
        const index = inventory.items.indexOf(item);
        const newQuantity = inventory.quantity;
        newQuantity[index] = newQuantity[index] + quantity;
        const update = { $set: { quantity: newQuantity } };
        options = { upsert: true };
        const result = await playerCollection.updateOne(query, update, options);
    } else {
        const newItems = inventory.items.concat(item);
        const newQuantity = inventory.quantity.concat(quantity);
        const update = { $set: { items: newItems, quantity: newQuantity } };
        options = { upsert: true };
        const result = await playerCollection.updateOne(query, update, options);
    }

    console.log("[DEBUG] Item " + item + " added to user " + id + ".");
}

exports.setClass = async function(id, className) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "info" };
    let options = { 
        projection: {_id: 0},
    };

    const info = await playerCollection.findOne(query, options);

    // if(info.class != "noclass") {
    //     return false;
    // }

    const update = { $set: { class: className } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);

    return true;
}