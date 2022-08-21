const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');

module.exports = {
    name: "start",
    aliases: [],
    description: "",
    execute(message, args) {
        dbUtils.doesPlayerExists(message.author.id).then(exists => {
            if(!exists) {
                dbUtils.createPlayer(message.author.id);
                message.reply('debug: created player');
            } else {
            message.reply('You already have a character!');
            }
        })
    }
}