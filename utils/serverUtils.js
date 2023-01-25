const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');

exports.registerServer = async function(serverId) {
    const serverCollection = Client.mongoDB.db('server-data').collection(serverId);

    const data = [
       {
        authorizedChannels: [],
       }
    ]

    const options = { ordered: true };
    
    const result = await serverCollection.insertMany(data, options);
    console.log("[DEBUG] Server ID " + serverId + " created.");
}

exports.getServerData = async function(serverId, query) {
    const serverCollection = Client.mongoDB.db('server-data').collection(serverId);

    return new Promise(resolve = async () => {
        const result = await serverCollection.findOne({}, query);
        console.log(result);
        resolve(result);
    });
}