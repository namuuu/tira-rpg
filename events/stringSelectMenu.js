const { prefix } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const inv = require('../utils/inventoryUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');
const { EmbedBuilder } = require('discord.js');
const combat = require('../utils/combatUtils.js');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction, client) {
        if (!interaction.isStringSelectMenu()) return;
	    
        const authorId = interaction.user.id;
        const { user, customId } = interaction;

        const args = customId.split('-');
        const command = args.shift();

        if(!db.doesPlayerExists(user.id).then(exists => { return exists; })) {
            return;
        }

        switch(command) {
            case 'displayInventory':
                inv.displayInventory(authorId, interaction);
                break;
            case 'combat_skill_selector':
                combat.receiveSkillSelector(interaction);
                break;
            case 'combat_target_selector':
                combat.receiveTargetSelector(interaction);
                break;
            case 'classChoice':

                if(args[0] != interaction.user.id) {
                    return;
                }
                
                await interaction.message.delete();

                db.createPlayer(interaction.user.id);

                db.setClass(interaction.user.id, interaction.values[0]);

                const displayEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(':crossed_swords: Ton voyage commence ! :crossed_swords:')
                .addFields( 
                    { name: 'Est ce que ton épopée sera écrite dans l\'\histoire ?', value: "Ton personnage a été créé, " + interaction.user.username }
                )
                .setThumbnail(interaction.user.displayAvatarURL());
            
                await interaction.channel.send({embeds: [displayEmbed]});
            default:
                return;
        }   
    }
}