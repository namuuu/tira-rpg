const { prefix } = require('../config.json');
const Client = require('discord.js');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const inventoryUtil = require('../utils/inventoryUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');
const combatManager = require('../manager/combatManager.js');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction, client) {
        if(interaction.message.author.id != client.user.id) return;
        if (!interaction.isButton()) return;
	    
        const { user, customId } = interaction;
        const userId = user.id;

        const args = customId.split('-');
        const command = args.shift();

        if(await !db.doesPlayerExists(user.id)) return;

        // console.log("Command: " + command);
        // console.log("Args: " + args);

        switch(command) {
            case 'displayInventory':
                inventoryUtil.displayInventory(userId, interaction);
                break;
            case 'joinFight':
                await combatManager.addPlayerToCombat(userId, args[0], args[1], interaction);
                break;
            default:
                break;
        }
    }
}