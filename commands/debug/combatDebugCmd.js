const combatManager = require('../../manager/combatManager.js');
const combatUtil = require('../../utils/combatUtils.js');

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
            case "create":
                combatManager.instanciateCombat(message, message.author);
                break;
            case "delete":
                combatManager.deleteCombat(message.channel);
                break;
            case "add-dummy":
                combatManager.addEntityToCombat(message.channel, "dummy");
                break;
            case "loop":
                const combatData = combatUtil.getCombatCollection(message.channel.id);
                if(combatData != null)
                    combatManager.combatLoop(message.channel, combatData);
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