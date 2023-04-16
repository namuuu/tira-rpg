const ability = require('../../utils/abilityUtils.js');

module.exports = {
  name: "debug-skill",
  aliases: ["debug-abi", "debug-ability", "debug-abilities"],
  description: "Debug command concerning abilities. Usage for developer only.",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const authorId = message.author.id;
    let query = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    if(args.length > 1)
        query = args.slice(1).join(" ");

    var id;

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "learn":
                var {name: id} = ability.searchAbility(query);
                if(id == null) {
                    message.reply("Ability not found. Please specify a valid ability name.");
                    return;
                }
                ability.learnAbility(authorId, id);
                break;
            case "unlearn":
                var {id} = ability.searchAbility(query);
                if(id == null) {
                    message.reply("Ability not found. Please specify a valid ability name.");
                    return;
                }
                ability.unlearnAbility(authorId, id);
                break;
            case "select":
                var {id} = ability.searchAbility(query);
                if(id == null) {
                    message.reply("Ability not found. Please specify a valid ability name.");
                    return;
                }
                ability.selectActiveAbility(authorId, id);
                break;
            case "unselect":
                var {id} = ability.searchAbility(query);
                if(id == null) {
                    message.reply("Ability not found. Please specify a valid ability name.");
                    return;
                }
                ability.unselectActiveAbility(authorId, id);
                break;
            case "test": {
                await ability.learnAbility(authorId, "slash");
                await ability.selectActiveAbility(authorId, "slash");
            }
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