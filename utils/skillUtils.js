const skillEffect = require("../setup/skillSetup.js");
const skills = require("../data/skills.json");
const fs = require('fs');
const { Client, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const player = require('../utils/playerUtils.js');
const inv = require("./inventoryUtils.js");


exports.execute = function(exeData) {
    //console.log(exeData);

    const skillEffectList = exeData.skill["effects"];
    let log = [];

    // Apply the attack's effects
    for(const effect of Object.entries(skillEffectList)) {
        skillEffect.map.get(effect[0])(exeData, effect[1], log); 
    }
    
    return log;
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
        return "not_learned";
    }
    if(inventory.activeSkills.length > 4) {
        console.error("[DEBUG] 4 Active Skills already used by user " + user_id + ". (ACTIVE_SKILL_MAX_SIZE)");
        return "max_size";
    }
    if(inventory.activeSkills.includes(skill_id)) {
        console.error("[DEBUG] Skill " + skill_id + " already selected active by " + user_id + ". (ACTIVE_SKILL_ALREADY_ACTIVE)");
        return "already_active";
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

    if(!inventory.skills.includes(skill_id)) {
        console.error("[DEBUG] Skill " + skill_id + " hasn't been selected by user " + user_id + ". (ACTIVE_SKILL_NOT_ACTIVE)");
        return "not_selected";
    }
    
    const newItems = [...(inventory.skills)];
    const removeIndex = newItems.indexOf(skill_id);
    if(removeIndex > -1)
        newItems.splice(removeIndex, 1);
    const update = { $set: { activeSkills: newItems } };
    options = { upsert: true };
    const result = await playerCollection.updateOne(query, update, options);
    console.log("[DEBUG] User " + user_id + " unselected skill " + skill_id + ".");

    return true;
}

function getStringActiveSkill(skills) {
    var data = JSON.parse(fs.readFileSync('./data/skills.json'));
    var string = "";

    if(skills.length != 0)
        for(const skill of skills) {
            string += `# ${data[skill].number} - ${data[skill].name}\n`;
        }
    else
        string = "No active skills selected.";

    return string;
}

async function sendStringAllSkills(username, userId) {
    const playerData = await player.getData(userId, "inventory");
    const skills = playerData.skills;
    const activeSkills = playerData.activeSkills;

    var data = JSON.parse(fs.readFileSync('./data/skills.json'));

    const embed = new EmbedBuilder()
        .setTitle(`${username}'s Skills`)
        .setFooter({text: 'Need to get more info about a specific skill ? Type t.skill <number>'})

    try {
        embed.setDescription(skills.length != 0 ? skills.map(skill => `# ${data[skill].number} - ${data[skill].name}`).join(", ") : "No skills learned.");
    } catch (error) {
        embed.setDescription("No skills learned. (There may be an error!)");
        console.error(error);
    }

    try {
        embed.addFields({name: "Active Skills", value: getStringActiveSkill(activeSkills)});
    } catch (error) {
        console.error(error);
        embed.addFields({name: "Active Skills", value: "No active skills selected. (There may be an error!)"});
    }

    return {embeds: [embed], components: [sendButtonChangeSkill(userId, skills.length != 0, activeSkills.length != 0)]};
}

function sendButtonChangeSkill(userId, skillEnable, activeSkillEnable) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("select_skill-" + userId)
                .setLabel("Select Skill")
                .setStyle("Secondary")
                .setDisabled(!skillEnable),
            new ButtonBuilder()
                .setCustomId("unselect_skill-" + userId)
                .setLabel("Unselect Skill")
                .setStyle("Secondary")
                .setDisabled(!activeSkillEnable),
        );

    return row;
}

exports.sendModal = function(interaction, select, userId) {
    if(interaction.user.id != userId) {
        interaction.reply({content: "This is not your inventory! If you need to, type `t.display`.", ephemeral: true});
        return;
    }

    const modal = new ModalBuilder()
        .setTitle("Skill Menu")
    
    const skillInput = new TextInputBuilder()
        .setCustomId("skill_input")
        .setPlaceholder("Ex: 155 or 'fireball'")
        .setMinLength(1)
        .setMaxLength(20)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    if(select == true) {
        modal.setCustomId("select_skill")
        skillInput.setLabel("Indicate the skill you want to use.")
    } else {
        modal.setCustomId("unselect_skill")
        skillInput.setLabel("Indicate the skill you want to unselect.")
    }

    modal.addComponents(new ActionRowBuilder().addComponents(skillInput));

    interaction.showModal(modal);
}

exports.receiveModal = async function(interaction, select) {
    const skill = interaction.fields.getTextInputValue("skill_input");
    const userId = interaction.user.id;
    var ret;

    if(select == true)
        ret = await exports.selectActiveSkill(userId, skill);
    else
        ret = await exports.unselectActiveSkill(userId, skill);
    
    if(ret == true) {
        //async function typeSkills(embed, playerId, playername)
        inv.display(interaction.user, interaction, "skills", false);
        if(select)
            interaction.reply({content: "Skill " + skill + " successfully selected.", ephemeral: true});
        else
            interaction.reply({content: "Skill " + skill + " successfully unselected.", ephemeral: true});
    } else {
        console.log(ret);
        switch(ret) {
            case "not_learned":
                interaction.reply({content: "You haven't learned this skill yet!", ephemeral: true});
                break;
            case "max_size":
                interaction.reply({content: "You have already selected 4 skills!", ephemeral: true});
                break;
            case "already_active":
                interaction.reply({content: "This skill is already active!", ephemeral: true});
                break;
            case "not_selected":
                interaction.reply({content: "This skill is not currently active!", ephemeral: true});
                break;
            default:
                interaction.reply({content: "This action doesn't seem right.", ephemeral: true});
        }
    }
}

exports.sendStringAllSkills = sendStringAllSkills;
exports.getStringActiveSkill = getStringActiveSkill;

