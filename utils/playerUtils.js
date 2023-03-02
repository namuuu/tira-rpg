const { Client } = require('discord.js');
const rpgInfoUtils = require('./rpgInfoUtils.js');
const classes = require('../data/classes.json');

// Player data management

exports.health = {};
exports.exp = {};
exports.class = {};
exports.stats = {};

exports.doesExists = async function(id) {
    const playerDatabase = Client.mongoDB.db('player-data');

    const find = await playerDatabase.listCollections({ name: id }).toArray();
    
    return find.length > 0;
}

exports.create = async function(id, className) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const classData = classes[className];

    const data = [
        { name: "info", class: className, level: 0, exp: 0, health: classData.base_stats.vitality, location: "tutorial" },
        { name: "stats", 
            strength: classData.base_stats.strength,
            vitality: classData.base_stats.vitality, 
            resistance: classData.base_stats.resistance, 
            dexterity: classData.base_stats.dexterity,
            agility: classData.base_stats.agility,
            intelligence: classData.base_stats.intelligence,
        },
        { name: "inventory", items: [], equipItems: [], skills: [] , activeSkills: [], equiped: {
            weapon: null,
            helmet: null,
            chestplate: null,
            boots: null,
        } },
        { name: "misc", lastRegen: Date.now(), party: { owner: id, members: [] }},
    ]

    const options = { ordered: true };
    
    const result = await playerCollection.insertMany(data, options);
    console.log("[DEBUG] User ID " + id + " created.");
}

exports.remove = async function(id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const result = await playerCollection.drop();
    console.log("[DEBUG] User ID " + id + " removed.");
}

exports.getData = async function(id, name) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: name };
    const options = { 
        projection: {_id: 0},
    };

    const result = await playerCollection.findOne(query, options);
    
    return result;
}

exports.updateData = async function(id, data, name) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: name };
    const update = { $set: data };
    const options = { upsert: true };

    playerCollection.updateOne(query, update, options);
}

exports.health.set = async function(userID, health) {
    const playerCollection = Client.mongoDB.db('player-data').collection(userID);

    const query = { name: "info" };
    let options = { 
        projection: {_id: 0, class: 0, level: 0, exp: 0},
    };

    const info = await playerCollection.findOne(query, options);

    const update = { $set: { health: health } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);
}

exports.health.add = async function(userID, health) {
    const playerCollection = Client.mongoDB.db('player-data').collection(userID);

    const query = { name: "info" };
    let options = { 
        projection: {_id: 0, class: 0, level: 0, exp: 0},
    };

    const info = await playerCollection.findOne(query, options);
    const newHealth = info.health + health;
    
    const update = { $set: { health: newHealth } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);
}

exports.health.passiveRegen = async function(userID) {
    //Math.floor(Date.now()/1000)
    const playerCollection = Client.mongoDB.db('player-data').collection(userID);

    let maxHealth = await exports.getData(userID, "stats");
    maxHealth = maxHealth.vitality;

    let lastRegen = await exports.getData(userID, "misc");
    lastRegen = lastRegen.lastRegen;

    let health = await exports.getData(userID, "info");
    health = health.health;

    if((Date.now() - lastRegen) < 1800000)
        return 0;

    const percHealth = (Date.now() - lastRegen) / 1000000 * 17.778;
    let newHealth = Math.round(health + maxHealth*(percHealth/100));
    if(newHealth > maxHealth)
        newHealth = maxHealth;

    //const newHealth = maxHealth.health + health;

    let query = { name: "info" };
    
    let update = { $set: { health: newHealth } };
    let options = { upsert: true };
    await playerCollection.updateOne(query, update, options);

    console.log(`[DEBUG] User ID ${userID} regenerated ${newHealth - health} through ${(Math.round((Date.now() - lastRegen)/60000))} minutes`);

    query = { name: "misc" };
    
    update = { $set: { lastRegen: Date.now() } };
    await playerCollection.updateOne(query, update, {upsert: true});

    return newHealth - health;
}

exports.exp.award = async function(id, exp, channel) {
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

exports.exp.getLevelRewards = async function(id, level, channel) {
    if(!channel)
        return;
    channel.send("Vous avez atteint le niveau " + level + " !");
}

exports.updateStats = async function(id, className) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    console.log(classes[className]);

    const strength = classes[className].base_stats.strength;
    const vitality = classes[className].base_stats.vitality;
    const resistance = classes[className].base_stats.resistance;
    const dexterity = classes[className].base_stats.dexterity;
    const agility = classes[className].base_stats.agility;
    const intelligence = classes[className].base_stats.intelligence;

    const query = { name : "stats"};
    const update = { $set: { strength: strength,
                             vitality: vitality,
                             resistance: resistance,
                             dexterity: dexterity,
                             agility: agility,
                             intelligence: intelligence, }};
    const result = await playerCollection.updateOne(query, update, {upsert: false});

    console.log(result);

    return true;
    
}

exports.setLocation = async function(id, location) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "info" };
    
    const update = { $set: { location: location } };
    const options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);

    return true;
}