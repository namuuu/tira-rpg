const skillEffect = require("../setup/skillSetup.js");
const skills = require("../data/skills.json");
const { Client, EmbedBuilder } = require('discord.js');


exports.execute = function(skillName, channel, combat) {
    const skillEffectList = skills[skillName]["effects"];
    console.log(typeof skillEffectList);
    for(const effect of Object.entries(skillEffectList)) {
        skillEffect.map.get(effect[0])(channel, combat, effect[1]); 
    }
    //return (skillEffect.map.get(skillName))(channel, combat, quantity);
}
exports.getSkill = function(skillName) {
    return skills[skillName];
}
exports.getEffect = function(skillEffect) {
    return skillEffect.map.get(skillName);
}
exports.searchSkill = function(query) {
    if(!isNaN(query)) {
        // The string contains a number
        for(const skill in skills) {
            if (skills[skill].number == query)
                return skills[skill];
        }
    } else {
        // The string does not contain a number
        for(const skill in skills) {
            if(skill == query)
                return skills[skill];
        }
    }
}
exports.displaySkill = function(skill) {
    return new EmbedBuilder()
        .setTitle(`#${skill.number} - ${skill.name}`)
        .setDescription(`${skill.description}`)
        .setColor(0x0099FF)
    
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