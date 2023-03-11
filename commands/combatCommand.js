const combat = require('../manager/combatManager.js');
const util = require('../utils/combatUtils.js');
const { EmbedBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: "combat",
  aliases: [],
  description: "Everything about combats. Use t.combat help for more information",
  requireCharacter: true,
  async execute(message, args) {

    if (args.length == 0) {
        indicateHelp(message);
        return;
    }

    const combat = await util.getCombatCollection(message.channelId);

    if((combat == undefined || combat == null) && args[0] != "help") {
        indicateHelp(message, "You need to use this command in a combat channel.");
        return;
    }

    switch (args[0]) {
        case "help":
            sendHelp(message);
        break;
        case "display":
            sendDisplayMessage(message, combat);
            break;
        case "ff":
        case "forfeit":
            util.sendForfeit(message);
            break;
        case "tl":
        case "time":
        case "timeline":
            util.displayTimeline(message);
            break;
        case "encounter":
            combat.instanciateCombat(message, message.author);
            break;
        default:
            indicateHelp(message);
        break;
    }
  }
}

function sendHelp(message) {
    const embed = new EmbedBuilder()
        .setTitle("Combat help")
        .addFields({value: "t.combat encounter", name: "Seek for a combat." })

    message.reply({ embeds: [embed] });
}

function indicateHelp(message, usage) {
    const embed = new EmbedBuilder()
        .setDescription("Invalid command!")
        .setFooter({ text: "Use t.combat help for more information" })
        .setColor(0xDC143C);

    if (usage) {
        embed.addFields({name: "Usage", value: usage});
    }

    message.channel.send({ embeds: [embed] }).then(msg => {
        setTimeout(() => {
            msg.delete();
            message.delete();
        }, 5000);
    });
}

function sendDisplayMessage(message, combat) {
    const embed = new EmbedBuilder()
        .setTitle("Na'vi, your personal combat assistant")
        .setDescription("You can use the buttons below to navigate through the combat displayer.")

    const row = new ActionRowBuilder()

    embed.setDescription("You can use the buttons below to navigate through the combat displayer.")
    embed.addFields({ name: "Team 1", value: teamDisplay(combat.team1), inline: true });
    embed.addFields({ name: "Team 2", value: teamDisplay(combat.team2), inline: true});
    addButton(row, "Team 1", ButtonStyle.Secondary, "combat.command-display-team1");
    addButton(row, "Team 2", ButtonStyle.Secondary, "combat.command-display-team2");

    message.channel.send({ embeds: [embed], components: [row] });
}

function teamDisplay(team) {
    let teamDisplay = "";

    for (let i = 0; i < team.length; i++) {
        teamDisplay += `${i + 1}. ${team[i].name}\n`;
    }

    return teamDisplay;
}

function addButton(row, label, style, customId) {
    row.addComponents(
        new ButtonBuilder()
            .setLabel(label)
            .setStyle(style)
            .setCustomId(customId)
    );
}
