const player = require('../../utils/playerUtils.js');
const skill = require('../../utils/skillUtils.js');

module.exports = {
  name: "debug-stat",
  aliases: [],
  description: "Debug command concerning statistics. Usage for developer only.",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const author = message.author;
    const authorId = author.id;
    let query = 10;
    if(args.length >= 2)
        query = parseInt(args[1]);

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "state":
                const state = await player.getState(authorId);
                if(state != null && state != undefined)
                    message.reply(author.username + "'s current state: " + state.name);
                else
                    message.reply("State is null or undefined.");
            case "add-exp":
                player.exp.award(authorId, query, message.channel);
                break;
            case "add-health":
                player.health.add(authorId, query);
                break;
            case "set-health":
                player.health.set(authorId, query);
                break;
            default:
                message.reply("Debug Command not found. Please specify a debug command according to the document.");
                break;
        }
    } catch (error) {
        console.log(error);
    }
    

    return;
  }
}