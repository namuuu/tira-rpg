const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');

module.exports = {
    name: "delete",
    aliases: [],
    description: "",
    requireCharacter: true,
    execute(message, args) {

        const arg = message.mentions.members.first().id;
        dbUtils.doesPlayerExists(arg).then(exists => {
            if(exists) {
                dbUtils.removePlayer(arg);
                message.reply('debug: deleted player');

                return;

            } else {

                message.reply('debug: no player to delete');
                return;
            }
        });
    }
}