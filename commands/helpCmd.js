const player = require('../utils/playerUtils.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "help",
    aliases: ["h", "help-me", "aide", "ayuda"],
    description: "",
    requireCharacter: false,
    async execute(message, args) {
        const author = message.author;

        if(await player.doesExists(author.id)) {
            const embed = new EmbedBuilder()
                .setTitle("Help command")
                .setThumbnail("https://media.discordapp.net/attachments/1100407962159284335/1100408291907084328/tira_picture.png?width=546&height=546")
                .setColor(0xADD8E6)
                .addFields(
                    { name: "Gitbook", value: "Most of the commands are explained in our [gitbook](https://tira-rpg.gitbook.io/tira-quest/), you should take a quick look at it."},
                    { name: "Support server", value: "If you need any help, you can join our [support server](https://discord.gg/y5A93HkPmS)."},
                    { name: "Any typo, incorrect or missing information?", value: "You can still report it to our developers in the support server, your help is gladly appreciated!"},
                    { name: "Inviting the bot", value: "Quite simlply, you can use the `t.invite` command!"}
                )

            message.channel.send({embeds: [embed]});
        } else {
            const newEmbed = new EmbedBuilder()
                .setTitle("Help command")
                .setThumbnail("https://media.discordapp.net/attachments/1100407962159284335/1100408291907084328/tira_picture.png?width=546&height=546")
                .setColor(0xADD8E6)
                .setDescription("Oh... Are you a new traveler? Nice to meet you! If you wish to start the journey, you can begin your journey by typing `t.begin`!")
                .addFields(
                    { name: "Gitbook", value: "Most of the commands are explained in our [gitbook](https://tira-rpg.gitbook.io/tira-quest/), you should take a quick look at it."},
                    { name: "Support server", value: "If you need any help, you can join our [support server](https://discord.gg/y5A93HkPmS)."},
                    { name: "Any typo, incorrect or missing information?", value: "You can still report it to our developers in the support server, your help is gladly appreciated!"},
                    { name: "Inviting the bot", value: "Quite simlply, you can use the `t.invite` command!"}
                )

            message.channel.send({embeds: [newEmbed]});
        }
    }
}