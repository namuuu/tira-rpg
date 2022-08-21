const { Client } = require('discord.js');

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
        { name: "info", class: 0, level: 0},
        { name: "stats", strength: 0, vitality: 0, resistance: 0, dexterity: 0, agility: 0, intelligence: 0 },
    ]

    const options = { ordered: true };
    
    const result = await playerCollection.insertMany(data, options);
    console.log("[DEBUG] User ID " + id + " created.");
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