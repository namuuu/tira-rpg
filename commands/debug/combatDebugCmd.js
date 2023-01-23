
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

    let playerId = message.author.id;
    let combatId = message.channel.id;

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "create":
                await combatdb.instanciateCombat(message.channel);
                break;
            case "delete":
                combatdb.deleteThread(message.channel);
                break;
            case "start":
                await combatdb.startCombat(message.channel);
                break;
            case "add-player":
                if(args.length >= 2)
                    playerId = args[1];
                if(args.length >= 3)
                    threadId = args[2];
                const startMessage = await message.channel.fetchStarterMessage();
                await combatdb.addPlayerToCombat(playerId, combatId, 1, startMessage);
                break;
            case "add-dummy":
                combatdb.addDummyEntityToCombat(message.channel);
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