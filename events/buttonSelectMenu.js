const { prefix } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const inv = require('../utils/inventoryUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction, client) {
        console.log(interaction);

        if (!interaction.isButton()) return;
	    
        const authorId = interaction.user.id;
        const { user, customId } = interaction;

        if(await !db.doesPlayerExists(user.id)) {
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