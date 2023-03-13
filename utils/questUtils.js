const { Client, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const quests = require('../data/quests.json');
const player = require('../utils/playerUtils.js');


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

exports.getData = async function(id) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);

    const query = { name: "story" };
    const options = { 
        projection: {_id: 0},
    };

    const result = await playerCollection.findOne(query, options);
    
    return result;
}

exports.setQuestStatus = async function(id, status) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);
    const datas = exports.getData(id)

    const query = { name: "story" };
    const update = { $set: datas };
    const options = { upsert: true };

    if(status != null){
        playerCollection.updateOne(query, update, options);
    }
}

exports.giveQuest= async function(id, idQuest) {
    const playerCollection = Client.mongoDB.db('player-data').collection(id);
    const playerData = await player.getData(id,"story")

    if(playerData.quests[idQuest] == undefined){
        return
    }
    datas.quests = {
        ...datas.quests,
        [idQuest]:{
            status:null,
            progression:0,
            nextQuest:null
        }
    }

    const query = { name: "story" };
    const update = { $set: datas };
    const options = { upsert: true };
    playerCollection.updateOne(query, update, options);
}

exports.hasQuest= async function(id, idQuest) {
    const playerData = await player.getData(id,"story")

    if(playerData.quests[idQuest] != null){
        return true
    }
    return false

}