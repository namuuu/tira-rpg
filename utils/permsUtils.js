const { Client } = require('discord.js');
const perms = require('../data/perms.json');

exports.addAdmin = async function(commandName) {
    const permCollection = Client.mongoDB.db('perm-data').collection('admin');

    const data = [
        { name: commandName, users : [] }
    ]
    
    const result = await permCollection.insertMany(data);
    console.log("BRO CA MARCHE OU PAS ???" + result);
}