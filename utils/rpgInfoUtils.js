// load json files
const { MessageEmbed } = require('discord.js');
const classJson = require('./../data/classes.json');
const db = require('./databaseUtils.js');


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