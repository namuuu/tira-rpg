const party = require('../utils/partyUtils.js');

module.exports = {
  name: "party",
  aliases: [],
  description: "Create a party with your friends, and defeat foes together!",
  requireCharacter: true,
  execute(message, args) {
    authorId = message.author.id;

    if(args.length == 0) {
        party.sendError(message, "You need to specify a party command!");
        return;
    }   
    try {
        switch(args[0]) {
            case "help":
                party.sendHelp(message);
                break;
            case "invite":
                if(args.length == 1) {
                    party.sendError(message, "You need to mention someone to invite them!");
                    return;
                }
                if(!message.mentions.members.first()) {
                    party.sendError(message, "You need to mention someone to invite them!");
                    return;
                }
                party.invite(message, message.mentions.members.first().id);
                break;
            case "display":
                if(args.length > 1) {
                    const mention = message.mentions.members.first();
                    if(!mention) {
                        party.sendError(message, "The person you mentionned is invalid");
                    } else
                        party.displayParty(message, mention.id);
                } else 
                    party.displayParty(message, authorId);
                break;
            case "leave":
                party.quit(message, authorId);
                break;
            default:
                party.sendError(message, "This party command does not exist!");
                break;
        }
    } catch (error) {
        console.error(error);
        message.channel.send("An error occured while executing this command, please contact the bot owner.");
    }
  }
}