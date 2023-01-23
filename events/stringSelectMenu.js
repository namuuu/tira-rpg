const { prefix } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const inv = require('../utils/inventoryUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');
const combat = require('../utils/combatUtils.js');

module.exports = {
    name: 'interactionCreate',
    trigger(interaction, client) {
        if (!interaction.isStringSelectMenu()) return;
	    
        const authorId = interaction.user.id;
        const { user, customId } = interaction;

        if(!db.doesPlayerExists(user.id).then(exists => { return exists; })) {
            return;
        }

        switch(customId) {
            case 'chooseClass':
                rpg.setClass(interaction.values[0], interaction);
                break;
            case 'displayInventory':
                inv.displayInventory(authorId, interaction);
                break;
            case 'combat_skill_selector':
                combat.receiveSkillSelector(interaction);
                break;
            case 'combat_target_selector':
                combat.receiveTargetSelector(interaction);
                break;
            default:
                break;
        }
    }
}