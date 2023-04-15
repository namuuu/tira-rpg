const player = require('../utils/playerUtils.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "init",
    aliases: ["start", "begin"],
    description: "",
    requireCharacter: false,
    async execute(message, args) {
        const author = message.author;

        if(!(await player.doesExists(author.id))) {
            const embed = new EmbedBuilder()
                .setTitle(":crossed_swords: Welcome to Tira's RPG !")
                .setDescription("Hello " + author.username + ", glad to see you interested in exploring the world of Orialla! I am Tira, one of the gods of this realm. I will be your guide on starting your journey. Let's begin!")
                .setColor(0xFF7F50)

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("welcome-0-" + author.id)
                        .setLabel("Continue")
                        .setStyle(ButtonStyle.Secondary)
                )

            message.channel.send({embeds: [embed], components: [button]});
        } else { 
            const displayEmbed = new EmbedBuilder()
                .setTitle("You already apart of an adventure!")
                .setDescription("Having multiple characters is too daunting of a task. You can only have one character at a time.")
        
            message.channel.send({embeds: [displayEmbed]});
        }
    }
}