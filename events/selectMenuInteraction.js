const { prefix } = require('./../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');

module.exports = {
    name: 'interactionCreate',
    trigger(interaction, client) {
        
        console.log(interaction.user.id);

        db.setClass(interaction.user.id, interaction.values[0]);
    }
}