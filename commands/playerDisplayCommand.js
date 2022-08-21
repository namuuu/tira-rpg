const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');

module.exports = {
    name: "display",
    aliases: [],
    description: "",
    requireCharacter: true,
    async execute(message, args) {
        const author = message.author;

        const playerInfo = await dbUtils.getPlayerData(author.id, "info");
        const playerStats = await dbUtils.getPlayerData(author.id, "stats");

        const displayEmbed = new MessageEmbed()
            .setColor(author.accentColor)
            .setAuthor({name: 'Interface du joueur'})
            .addFields( 
                { name: 'Nom', value:  author.username },
                { name: 'Niveau', value: playerInfo.level + " " },
                { name: 'Classe', value:  playerInfo.class + " " },
                { name: 'Force', value: playerStats.strength + " ", inline: true },
                { name: 'Vitalité', value: playerStats.vitality + " ", inline: true },
                { name: 'Résistance', value: playerStats.resistance + " ", inline: true },
                { name: 'Dextérité', value: playerStats.dexterity + " ", inline: true },
                { name: 'Agilité', value: playerStats.agility + " ", inline: true },
                { name: 'Intelligence', value: playerStats.intelligence + " ", inline: true },
             )
             .setThumbnail(author.displayAvatarURL());
            
            message.channel.send({embeds: [displayEmbed]});
            return;
    }
}