const player = require('../utils/playerUtils.js');
const inv = require('../utils/inventoryUtils.js');
const { EmbedBuilder } = require('discord.js');
const combat = require('../utils/combatUtils.js');
const zoneData = require('../data/zones.json');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction) {
        if (!interaction.isStringSelectMenu()) return;
	    
        const authorId = interaction.user.id;
        const { user, customId } = interaction;

        const args = customId.split('-');
        const command = args.shift();

        //console.log(command);
        //console.log(args);

        switch(command) {
            case 'displayInventory':
                if(!(await player.doesExists(user.id))) return;
                inv.displayInventory(authorId, interaction);
                break;
            case 'combat_skill_selector':
                if(!(await player.doesExists(user.id))) return;
                combat.receiveSkillSelector(interaction);
                break;
            case 'combat_target_selector':
                if(!(await player.doesExists(user.id))) return;
                combat.receiveTargetSelector(interaction);
                break;
            case 'classChoice':
                if(args[0] != interaction.user.id) {
                    interaction.channel.send("If you would like to start your own adventure, please use the t.init commande yourself ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                await interaction.message.delete();

                player.create(interaction.user.id);

                player.setClass(interaction.user.id, interaction.values[0]);

                const displayEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(':crossed_swords: Ton voyage commence ! :crossed_swords:')
                .addFields( 
                    { name: 'Est ce que ton épopée sera écrite dans l\'\histoire ?', value: "Ton personnage a été créé, " + interaction.user.username }
                )
                .setThumbnail(interaction.user.displayAvatarURL());
            
                await interaction.channel.send({embeds: [displayEmbed]});

            case 'locationChoice':
                if(args[0] != interaction.user.id) {
                    interaction.channel.send("If you would like to move your own character, please use the t.move commande yourself ! " + "<@" + interaction.user.id + ">");
                    return;
                }

                await interaction.message.delete();

                player.setLocation(interaction.user.id, interaction.values[0]);

                const displayEmbed2 = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(':crossed_swords: Tu as changé de lieu ! :crossed_swords:')
                .addFields(
                    { name: 'Tu es maintenant dans :', value: zoneData[interaction.values[0]].name }
                )
                .setThumbnail(interaction.user.displayAvatarURL());

                await interaction.channel.send({embeds: [displayEmbed2]});
            default:
                return;
        }   
    }
}