const player = require('../utils/playerUtils.js');
const combat = require('../manager/combatManager.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  name: "combat",
  aliases: [],
  description: "Everything about combats. Use t.combat help for more information",
  requireCharacter: true,
  execute(message, args) {

    if (args.length == 0) {
        indicateHelp(message);
        return;
    }

    switch (args[0]) {
        case "help":
            sendHelp(message);
        break;
        case "display":
            
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
        embed.addField("Usage", usage);
    }

    message.channel.send({ embeds: [embed] }).then(msg => {
        setTimeout(() => {
            msg.delete();
            message.delete();
        }, 5000);
    });
}