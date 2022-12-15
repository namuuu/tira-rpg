const { prefix } = require('./../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');

module.exports = {
    name: 'interactionCreate',
    trigger(interaction, client) {
        if (!interaction.isStringSelectMenu()) return;
	    
        const { user, customId } = interaction;

        if(!db.doesPlayerExists(user.id).then(exists => { return exists; })) {
            return;
        }

        switch(customId) {
            case 'chooseClass':
                rpg.setClass(interaction.values[0], interaction);
            default:
                return;
        }
    }
}