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
        { name: "info", class: "noclass", level: 0, exp: 0, health: 10 },
        { name: "stats", strength: 0, vitality: 10, resistance: 0, dexterity: 0, agility: 0, intelligence: 0 },
        { name: "inventory", items: [], quantity: [], skills: [] , activeSkills: []},
        { name: "misc", lastRegen: Date.now()},
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

exports.setHealth = async function(userID, health) {
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

// TODO : Currently does not handle max health.
exports.addHeath = async function(userID, health) {
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

exports.passiveRegen = async function(userID) {
    //Math.floor(Date.now()/1000)
    const playerCollection = Client.mongoDB.db('player-data').collection(userID);

    let maxHealth = await exports.getPlayerData(userID, "stats");
    maxHealth = maxHealth.vitality;

    let lastRegen = await exports.getPlayerData(userID, "misc");
    lastRegen = lastRegen.lastRegen;

    let health = await exports.getPlayerData(userID, "info");
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
    options = { upsert: true };
    await playerCollection.updateOne(query, update, options);

    return newHealth - health;
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
        projection: {_id: 0, skills: 0},
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

exports.learnSkill = async function(id, skill_id)  {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.skills.includes(skill_id)) {
        console.log("[DEBUG] Skill " + skill_id + " already exists for user " + id + ".");
        return false;
    } else {
        const newItems = inventory.skills.concat(skill_id);
        const update = { $set: { skills: newItems } };
        options = { upsert: true };
        const result = await playerCollection.updateOne(query, update, options);
        console.log("[DEBUG] User " + id + " learned skill " + skill_id + ".");
        return true;
    }
}

exports.unlearnSkill = async function(user_id, skill_id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(user_id);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.skills.includes(skill_id)) {
        const newItems = [...(inventory.skills)];
        const removeIndex = newItems.indexOf(skill_id);
        if(removeIndex > -1)
            newItems.splice(removeIndex, 1);
        const update = { $set: { skills: newItems } };
        options = { upsert: true };
        const result = await playerCollection.updateOne(query, update, options);
        console.log("[DEBUG] User " + user_id + " forgot skill " + skill_id + ".");
    } else {
        console.error("[DEBUG] Skill " + skill_id + " hasn't been learned by user " + user_id + ". (UNLEARN_SKILL_MISSING)");
    }
}

exports.hasSkill = async function(user_id, skill_id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(user_id);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.skills.includes(skill_id)) {
        return true;
    } else  {
        return false;
    }
}

exports.selectActiveSkill = async function(user_id, skill_id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(user_id);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(!inventory.skills.includes(skill_id)) {
        console.error("[DEBUG] Skill " + skill_id + " hasn't been learned by user " + user_id + ". (ACTIVE_SKILL_NOT_LEARNED)");
        return false;
    }
    if(inventory.activeSkills.length > 4) {
        console.error("[DEBUG] 4 Active Skills already used by user " + user_id + ". (ACTIVE_SKILL_MAX_SIZE)");
        return false;
    }
    if(inventory.activeSkills.includes(skill_id)) {
        console.error("[DEBUG] Skill " + skill_id + " already selected active by " + user_id + ". (ACTIVE_SKILL_ALREADY_ACTIVE)");
        return false;
    }

    const newItems = inventory.activeSkills.concat(skill_id);
    const update = { $set: { activeSkills: newItems } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);
    console.log("[DEBUG] User " + user_id + " selected skill " + skill_id + ".");
    return true;
}

exports.unselectActiveSkill = async function(user_id, skill_id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(user_id);

    const query = { name: "inventory" };
    let options = { 
        projection: {_id: 0, items: 0, quantity: 0},
    };

    const inventory = await playerCollection.findOne(query, options);
    
    if(inventory.activeSkills.includes(skill_id)) {
        const newItems = [...(inventory.skills)];
        const removeIndex = newItems.indexOf(skill_id);
        if(removeIndex > -1)
            newItems.splice(removeIndex, 1);
        const update = { $set: { activeSkills: newItems } };
        options = { upsert: true };
        const result = await playerCollection.updateOne(query, update, options);
        console.log("[DEBUG] User " + user_id + " unselected skill " + skill_id + ".");
    } else {
        console.error("[DEBUG] Skill " + skill_id + " hasn't been selected by user " + user_id + ". (ACTIVE_SKILL_NOT_ACTIVE)");
    }
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