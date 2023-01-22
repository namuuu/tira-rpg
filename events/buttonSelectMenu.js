const { prefix } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const inv = require('../utils/inventoryUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');

module.exports = {
    name: 'interactionCreate',
    trigger(interaction, client) {
        console.log(interaction);

        if (!interaction.isButton()) return;
	    
        const authorId = interaction.user.id;
        const { user, customId } = interaction;

        if(!db.doesPlayerExists(user.id).then(exists => { return exists; })) {
            return;
        }

        switch(customId) {
            case 'displayInventory':
                inv.displayInventory(authorId, interaction);
                break;
            default:
                break;
        }
    }
}