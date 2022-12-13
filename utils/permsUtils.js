const { Client } = require('discord.js');
const perms = require('../data/perms.json');

exports.addAdmin = async function(commandName) {
    const admin = Client.mongoDB.db('perm-data').collection('admin');

    const data = [
        { name: commandName, users : [] }
    ]
    
    const result = await admin.insertMany(data);
    console.log("BRO CA ADDADMIN OU PAS ???" + result);
}

exports.addToCommand = async function(commandName, userName) {
    const admin = Client.mongoDB.db('perm-data').collection('admin');

    const filter = { name: commandName };

    const update = { 
        $push: {
            users: userName
        },
    }

    const result = await admin.updateOne(filter, update);
    console.log("BRO CA ADDTOCOMMAND OU PAS ???" + result);
}

exports.doesPermExists = async function(commandName) {
    const admin = Client.mongoDB.db('perm-data').collection('admin');

    return new Promise( resolve => { 
        admin.listIndexes({name: commandName}).toArray(function(err, collections) {
            if(collections.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    });
}


exports.checkPerms = async function(commandName, userName) {
    const admin = Client.mongoDB.db('perm-data').collection('admin');

    const query = { name: commandName };
    const options = { users: userName};

    const result = await admin.findOne(query, options);

    if (result == null) {
        return false;
    }
    
    return true;
}