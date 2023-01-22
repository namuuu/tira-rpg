
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
            case "start":
                message.channel.send("Join this fight !").then(async (msg) => {
                    await combatdb.instanciateCombat(msg);
                });
                break;
            case "delete":
                combatdb.deleteThread(message.channel);
                break;
            case "joinfight":
                if(args.length >= 2)
                    playerId = args[1];
                if(args.length >= 3)
                    threadId = args[2];
                await combatdb.joinFight(playerId, combatId, 1);
                break;
            case "add-time":
                let time = 50;
                if(args.length >= 2)
                    time = parseInt(args[1]);
                if(args.length >= 3)
                    playerId = parseInt(args[2]);
                await combatdb.addTimeline(combatId, playerId, time);
                var fastestPlayer = await combatdb.getSoonestTimelineEntity(message.channel.id);

                message.reply("The fastest player's id is now " + fastestPlayer.id + " and his timeline is " + fastestPlayer.timeline + ".");
                break;
            case "fastest-player":
                var fastestPlayer = await combatdb.getSoonestTimelineEntity(message.channel.id);
                console.log(fastestPlayer);
                message.reply("The fastest player's id is " + fastestPlayer.id + " and his timeline is " + fastestPlayer.timeline + ".");
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