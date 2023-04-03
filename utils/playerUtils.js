const { Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const rpgInfoUtils = require('./rpgInfoUtils.js');
const classes = require('../data/classes.json');

// Player data management

exports.health = {};
exports.energy = {};
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

    const skill = JSON.parse(fs.readFileSync(`./data/misc/levelRewards.json`))[className]["0"][0];
    const data = [
        { name: "info", class: className, money: 100, level: 1, exp: 0, state: {name: "idle"}, health: classData.base_stats.vitality, max_health: classData.base_stats.vitality, energy: 3 },
        { name: "stats", 
            strength: classData.base_stats.strength,
            vitality: classData.base_stats.vitality, 
            resistance: classData.base_stats.resistance, 
            spirit: classData.base_stats.spirit,
            agility: classData.base_stats.agility,
            intelligence: classData.base_stats.intelligence,
        },
        { name: "inventory", items: [], equipItems: [], skills: [skill.id] , activeSkills: [skill.id], equiped: {
            weapon: null,
            helmet: null,
            chestplate: null,
            boots: null,
        } },
        { name: "misc", lastRegen: Date.now(), lastEnergy: Date.now(), party: { owner: id, members: [] }},
        { name : "story", locations: {
            current_location: "serene",
            current_zone: "capital",
            unlocked_locations: ["serene"],
        }, quests:[] }
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

exports.getEquiped = async function(id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);
    const result = await playerCollection.findOne({ name: "inventory" }, { projection: {_id: 0, items: 0, equipItems: 0, skills: 0, activeSkills: 0} });

    return result.equiped;
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
        projection: {_id: 0, class: 0, level: 0, exp: 0, money: 0, state: 0, energy: 0, location: 0},
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

    let lastRegen = await exports.getData(userID, "misc");
    lastRegen = lastRegen.lastRegen;

    let health = await exports.getData(userID, "info");
    let maxHealth = health.max_health;
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

exports.energy.set = async function(userID, energy) {
    const playerCollection = Client.mongoDB.db('player-data').collection(userID);

    if(energy > 3)
        energy = 3;

    const query = { name: "info" };
    let options = { 
        projection: {_id: 0, class: 0, level: 0, exp: 0, money: 0, state: 0, health: 0, location: 0},
    };

    const info = await playerCollection.findOne(query, options);

    const update = { $set: { energy: energy } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);
}

exports.energy.add = async function(userID, energy) {
    const playerCollection = Client.mongoDB.db('player-data').collection(userID);

    const query = { name: "info" };
    let options = {
        projection: {_id: 0, class: 0, level: 0, exp: 0, money: 0, state: 0, health: 0, location: 0},
    };

    const info = await playerCollection.findOne(query, options);    
    var newEnergy = info.energy + energy;

    if(newEnergy > 3)
        newEnergy = 3;

    const update = { $set: { energy: newEnergy } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);
}

exports.energy.passiveRegen = async function(userID) {
    const playerCollection = Client.mongoDB.db('player-data').collection(userID);

    let maxEnergy = 3;

    let lastRegen = await exports.getData(userID, "misc");
    lastRegen = lastRegen.lastEnergy;

    let energy = await exports.getData(userID, "info");
    energy = energy.energy;

    if(energy >= maxEnergy)
        return 0;

    if((Date.now() - lastRegen) < 3600000) {
        return 0;
    } else if ( (Date.now() - lastRegen) < 7200000) {
        energy = energy + 1;
        var result = 1;
    } else if ( (Date.now() - lastRegen) < 10800000) {
        energy = energy + 2;
        var result = 2;
    } else {
        energy = 3;
        var result = 3;
    }

    if (energy > maxEnergy)
        energy = maxEnergy;

    await exports.energy.set(userID, energy);

    query = { name: "misc" };
    
    update = { $set: { lastEnergy: Date.now() } };
    
    await playerCollection.updateOne(query, update, {upsert: true});

    return result;
}

exports.exp.award = async function(id, exp, channel) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const info = await playerCollection.findOne({ name: "info" }, { projection: {_id: 0}});

    const newExp = info.exp + exp;
    const newLevel = rpgInfoUtils.calculateNewLevelExp(info.level, newExp);
    
    await playerCollection.updateOne({ name: "info" }, { $set: { exp: newLevel.exp, level: newLevel.level } }, { upsert: true });

    for(let i=info.level; i<newLevel.level; i++) {
        exports.exp.getLevelRewards(id, i+1, channel, info.class);
    }
}

exports.levelUpStats = async function(id, level) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    var query = { name: "info" };
    const info = await playerCollection.findOne(query);
    const userClass = info.class;

    const strength = classes[userClass].base_stats.strength*1 + Math.floor(((level*1 + (Math.random() * level)*0.1)*classes[userClass].mult_stats.strength)*0.5);
    const vitality = classes[userClass].base_stats.vitality*1 + Math.floor(((level*1 + (Math.random() * level)*0.1)*classes[userClass].mult_stats.vitality)*0.5);
    const resistance = classes[userClass].base_stats.resistance*1 + Math.floor(((level*1 + (Math.random() * level)*0.1)*classes[userClass].mult_stats.resistance)*0.5);
    const spirit = classes[userClass].base_stats.spirit*1 + Math.floor(((level*1 + (Math.random() * level)*0.1)*classes[userClass].mult_stats.spirit)*0.5);
    const agility = classes[userClass].base_stats.agility*1 + Math.floor(((level*1 + (Math.random() * level)*0.1)*classes[userClass].mult_stats.agility)*0.5);
    const intelligence = classes[userClass].base_stats.intelligence*1 + Math.floor(((level*1 + (Math.random() * level)*0.1)*classes[userClass].mult_stats.intelligence)*0.5);

    query = { name: "stats" };
    const update = { $set: { strength: strength,
                             vitality: vitality,
                             resistance: resistance,
                             spirit: spirit,
                             agility: agility,
                             intelligence: intelligence, }};
    const result = await playerCollection.updateOne(query, update, {upsert: false});

    
}

exports.exp.getLevelRewards = async function(id, level, channel, userClass) {
    const info = await exports.getData(id, "info");
    if(!channel)
        return;

    const embed = new EmbedBuilder();
    embed.setColor(0x00FF00);
    embed.setTitle(`Level Up!`);
    embed.setDescription(`<@${id}> has reached level ${level}!`);

    var field = "";

    const levelRewards = JSON.parse(fs.readFileSync("./data/misc/levelRewards.json", "utf8"))[userClass];
    if(levelRewards != undefined && levelRewards[level] != undefined) {
        for(let i=0; i<levelRewards[level].length; i++) {
            const reward = levelRewards[level][i];

            switch(reward.type) {
                case "skill":
                    const { learnSkill } = require("./skillUtils.js");
                    learnSkill(id, reward.id);
                    field += `Skill: ${reward.name}\n`;
            }
        }
    }

    if(field != "")
        embed.addFields({ name: "Rewards", value: field });

    channel.send({ embeds: [embed] });

    exports.levelUpStats(id, level);
}


exports.setClass = async function(id, className) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);
    await playerCollection.updateOne({ name: "info" }, { $set: { class: className } }, { upsert: true });

    this.updateStats(id, className);

    return true;
}

exports.updateStats = async function(id, className) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    console.log(classes[className]);

    const strength = classes[className].base_stats.strength;
    const vitality = classes[className].base_stats.vitality;
    const resistance = classes[className].base_stats.resistance;
    const spirit = classes[className].base_stats.spirit;
    const agility = classes[className].base_stats.agility;
    const intelligence = classes[className].base_stats.intelligence;

    const query = { name : "stats"};
    const update = { $set: { strength: strength,
                             vitality: vitality,
                             resistance: resistance,
                             spirit: spirit,
                             agility: agility,
                             intelligence: intelligence, }};
    const result = await playerCollection.updateOne(query, update, {upsert: false});

    return true;
    
}

exports.setLocation = async function(id, zone) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "story" };
    
    var update = { 
        $set: { "locations.current_zone": zone } 
    };
    
    const options = { upsert: true };
    await playerCollection.updateOne(query, update, options);

    return true;
}

exports.setState = async function (playerCollection, id, state) {
    if(playerCollection == null || playerCollection == undefined)
        playerCollection = Client.mongoDB.db('player-data').collection(id);
    const query = { name: "info" };

    if(typeof state == "string")
        state = {name: state};

    const update = { $set: { state: state } };

    playerCollection.updateOne(query, update, {upsert: true});
}

exports.getState = async function (id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "info" };
    let options = { 
        projection: {_id: 0, class: 0, level: 0, exp: 0},
    };

    const info = await playerCollection.findOne(query, options);
    return info.state;
}

exports.giveMoney = async function(id, amount) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);
    const info = await this.getData(id, "info");
    const newMoney = info.money + amount;

    const query = { name: "info" };

    const update = { $set: { money: newMoney } };
    const options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);

    return true;
}

exports.takeMoney = async function(id, amount, message) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);
    const info = await this.getData(id, "info");
    const newMoney = info.money - amount;

    if (newMoney < 0) {
        message.channel.send("You don't have enough money to do that.");
        return false;
    }

    const query = { name: "info" };
    const update = { $set: { money: newMoney } };
    const options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);

    return true;
}
