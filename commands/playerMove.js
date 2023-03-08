const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const messageUtils = require('../utils/messageTemplateUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "move",
    description: "",
    requireCharacter: true,
    execute(message, args) {

            messageUtils.generateLocationSelector(message);
        
            return;
    }
}