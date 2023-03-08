const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const messageUtils = require('../utils/messageTemplateUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "shop",
    description: "",
    requireCharacter: true,
    execute(message, args) {

            messageUtils.generateShopSelector(message);
        
            return;
    }
}