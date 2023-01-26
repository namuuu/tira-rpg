const player = require('../utils/playerUtils.js');
const messageUtils = require('../utils/messageTemplateUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "init",
    aliases: ["start"],
    description: "",
    requireCharacter: false,
    execute(message, args) {
        player.doesPlayerExists(message.author.id).then(exists => {
            const author = message.author;
            
            if(!exists) {
                messageUtils.generateSelector(message);
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