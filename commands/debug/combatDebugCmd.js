
const dbUtils = require('../../utils/databaseUtils.js');
const combatdb = require('../../utils/combatUtils.js');

module.exports = {
  name: "debug-combat",
  aliases: [],
  description: "Debug command concerning combat. Usage for developer only.",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "start":
                message.channel.send("Join this fight !").then(async (msg) => {
                    let thread = await combatdb.createThread(msg);
                    await combatdb.instanciateCombat(msg.id);
                });
                //combatdb.createThread(combatMessage);
                break;
            case "delete":
                combatdb.deleteThread(message.channel);
                break;
            case "joinfight":
                let playerId = message.author.id;
                if(args.length >= 2)
                    playerId = args[1];
                let threadId = message.channel.id;
                if(args.length >= 3)
                    threadId = args[2];
                await combatdb.joinFight(playerId, threadId);
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