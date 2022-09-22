// load json files
const { MessageEmbed } = require('discord.js');
const classJson = require('./../data/classes.json');
const db = require('./databaseUtils.js');

/**
  Adds a Class to a specific user that interacted with a Slider.
  The setClass checks if the user has no class in order to work.
**/
exports.setClass = async function(className, interaction) {
    console.log(interaction);

    const { user, channel, mesage } = interaction;
    const result = await db.setClass(user.id, className);

    if(result) {
        const newClassEmbed = new MessageEmbed()
            .setColor("00ff00")
            .addFields( 
                { name: 'Félicitations !', value: "Vous possédez dorénavant la classe **" + classJson[className].name + "** !" },
             )
            
        interaction.reply({embeds: [newClassEmbed], ephemeral: true});
        return;
    } else {
        interaction.reply("Vous possédez déjà une classe + " + user.username + " !", )
        return;
    }

    
}

/**
  Get the classData (json/classes.json).
**/
exports.getClassData = function(className) {
    if(className != null) {
        return classJson[className];
    }
    return classJson;
}

exports.calculateExpToNextLevel = function(level) {
    expToNextLevel = 4*level*level + 6*level + 10;
    return expToNextLevel;
}

exports.calculateNewLevelExp = function(level, exp) {
    expToNextLevel = 4*level*level + 6*level + 10;
    while(exp >= expToNextLevel) {
        level += 1;
        exp -= expToNextLevel;
        expToNextLevel = 4*level*level + 6*level + 10;
    }
    return { level: level, exp: exp };
}