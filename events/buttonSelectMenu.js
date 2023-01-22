const { prefix } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const inventoryUtil = require('../utils/inventoryUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');
const combatUtil = require('../utils/combatUtils.js');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction, client) {
        console.log(interaction);

        if (!interaction.isButton()) return;
	    
        const authorId = interaction.user.id;
        const { user, customId } = interaction;

        const args = customId.split('-');
        const command = args.shift();

        if(await !db.doesPlayerExists(user.id)) {
            return;
        }

        console.log("Command: " + command);
        console.log("Args: " + args);

        switch(command) {
            case 'displayInventory':
                inventoryUtil.displayInventory(authorId, interaction);
                break;
            case 'joinFight':
                await combatUtil.addPlayerToCombat(authorId, args[0], args[1], interaction.message);
                interaction.reply({ content: 'You have joined the combat!', ephemeral: true });
            default:
                break;
        }
    }
}