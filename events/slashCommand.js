const { prefix } = require('./../config.json');
const { MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');

module.exports = {
    name: 'interactionCreate',
    trigger(interaction, client) {
        /* DEPRECATED */
        // if(!interaction.isChatInputCommand()) return;

        // const args = interaction.commandName;

        // console.log(interaction.options);

        // interaction.reply('Hello!');
    }
}