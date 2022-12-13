const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "init",
    aliases: ["start"],
    description: "",
    requireCharacter: false,
    execute(message, args) {
        dbUtils.doesPlayerExists(message.author.id).then(exists => {
            const author = message.author;
            
            if(!exists) {
                dbUtils.createPlayer(message.author.id);
                message.reply('debug: created player');

                const displayEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(':crossed_swords: Ton voyage commence ! :crossed_swords:')
                .addFields( 
                    { name: 'Est ce que ton épopée sera écrite dans l\'\histoire ?', value: "Ton personnage a été créé, " + author.username }
                )
                .setThumbnail(author.displayAvatarURL());
        
                message.channel.send({embeds: [displayEmbed]});
                return;

            } else {

                const displayEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(':octagonal_sign: Tu possèdes déjà un personnage ! :octagonal_sign:')
                .addFields( 
                    { name: 'Qu\'\est ce que tu essayes de faire ?', value: "C'est pas giga cool, " + author.username }
                )
                .setThumbnail(author.displayAvatarURL());
        
                message.channel.send({embeds: [displayEmbed]});
                return;

            }
        });
    }
}