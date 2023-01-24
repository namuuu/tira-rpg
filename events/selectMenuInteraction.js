const { prefix } = require('./../config.json');
const { MessageEmbed } = require('discord.js');
const db = require('../utils/databaseUtils.js');
const rpg = require('../utils/rpgInfoUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async trigger(interaction, client) {
        if (!interaction.isStringSelectMenu()) return;
            
        const { user, customId } = interaction;

        if(!db.doesPlayerExists(user.id).then(exists => { return exists; })) {
            return;
        }

        switch(customId) {
            case 'class-choice':
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
            
                await interaction.reply({embeds: [displayEmbed]});
            default:
                return;
        }   
    }
}