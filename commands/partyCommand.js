const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const party = require('../utils/partyUtils.js');

module.exports = {
  name: "party",
  aliases: [],
  description: "Create a party with your friends, and defeat foes together!",
  requireCharacter: true,
  execute(message, args) {
    authorId = message.author.id;

    if(args.length == 0) {
        party.sendError(message);
        return;
    }   

    switch(args[0]) {
        case "help":
            party.sendHelp(message);
            break;
        case "display":
            if(args.length > 1)
                party.displayParty(message, message.mentions.members.first().id);
            else 
                party.displayParty(message, authorId);
            break;
        default:
            party.sendError(message);
            break;
    }
  }
}