const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../utils/messageTemplateUtils.js');

module.exports = {
    name: "test",
    aliases: [],
    description: "",
    requireCharacter: false,
    execute(message, args) {
        console.log(message);
    }
}