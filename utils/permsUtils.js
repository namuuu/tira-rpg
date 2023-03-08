const { Client } = require('discord.js');
const permsUtils = require('../utils/permsUtils.js');

exports.addAdmin = async function(commandName) {
    const admin = Client.mongoDB.db('perm-data').collection(commandName);

    const data = [
        { name: commandName, users : [] }
    ]
    
    const result = await admin.insertMany(data);
    console.log("BRO CA ADDADMIN OU PAS ???" + result);
}   

exports.addToCommand = async function(commandName, userName) {
    const admin = Client.mongoDB.db('perm-data').collection(commandName);

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
    const admin = Client.mongoDB.db('perm-data');

    return new Promise( resolve => { 
        admin.listCollections({name: commandName}).toArray(function(err, collections) {
            if(collections.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    });
}


exports.hasPerms = async function(commandName, userName) {

    return new Promise( resolve => { 
        permsUtils.doesPermExists(commandName).then(exists => {
            if (!exists) {
                console.log("perm non trouvee ");
                resolve(true);
            }

            const admin = Client.mongoDB.db('perm-data').collection(commandName);

            const query = { users: userName};

            admin.findOne(query).then(exists => {
                console.log(exists);
                if (!exists) {
                    resolve(false);
                }

                resolve(true);
            })
        })
    });
}

exports.checkPerms = async function(commandName, userName) {

    return new Promise( resolve => { 
        permsUtils.doesPermExists(commandName).then(exists => {
            if (!exists) {
                console.log("perm non trouvee ");
                resolve(false);
            }

            const admin = Client.mongoDB.db('perm-data').collection(commandName);

            const query = { users: userName};

            admin.findOne(query).then(exists => {
                if (!exists) {
                    resolve(false);
                }

                resolve(true);
            })
        })
    });
}