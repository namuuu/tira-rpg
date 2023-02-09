const combatManager = require('../../manager/combatManager.js');

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

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "create":
                combatManager.instanciateCombat(message, playerId);
                break;
            case "delete":
                combatManager.deleteCombat(message.channel);
                break;
            case "add-dummy":
                combatManager.addEntityToCombat(message.channel, "dummy");
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