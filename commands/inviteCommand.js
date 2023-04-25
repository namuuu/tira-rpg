const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders")
const { ButtonStyle } = require("discord.js")

module.exports = {
    name: "invite",
    aliases: ["gitbook", "wiki", "support"],
    description: "Gives you the link to get Tira onto your server!",
    requireCharacter: true,
    execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle("Invite Tira to your server!")
            .addFields(
                { name: "Gitbook", value: "Our gitbook possesses all the information you need to play Tira. Click [here](https://tira-rpg.gitbook.io/tira-quest/) to go to the gitbook." },
                { name: "Support server", value: "Click [here](https://discord.gg/y5A93HkPmS) to join our support server if you need any help."}
            )

            const row = new ActionRowBuilder()
            .addComponents(
               new ButtonBuilder()
                  .setLabel("Invite the Tira's RPG Bot")
                  .setURL("https://discord.com/oauth2/authorize?client_id=681074990925479938&permissions=397891677377&scope=bot")
                  .setStyle(ButtonStyle.Link)
            )

        message.channel.send({ embeds: [embed], components: [row] });
    }
}