const { Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const quests = require('../data/quests.json');


exports.getName = function(id){
    return quests[id].name;
}

exports.getDescription = function(id){
    return quests[id].description;
}

exports.getRewards = function(id){
    return quests[id].rewards;
}

exports.getNextQuest = function(id){
    return quests[id].nextQuest;
}

