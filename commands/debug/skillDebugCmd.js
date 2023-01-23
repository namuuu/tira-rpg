const skill = require('../../utils/skillUtils.js');

module.exports = {
  name: "debug-skill",
  aliases: [],
  description: "Debug command concerning skills. Usage for developer only.",
  requireCharacter: true,
  execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const authorId = message.author.id;
    let skillQuery = "debugger";
    if(args.length >= 2)
        skillQuery = args[1];

    console.log(skill);

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "learn":
                skill.learnSkill(authorId, skillQuery);
                break;
            case "unlearn":
                skill.unlearnSkill(authorId, skillQuery);
                break;
            case "select":
                skill.selectActiveSkill(authorId, skillQuery);
                break;
            case "unselect":
                skill.unselectActiveSkill(authorId, skillQuery);
                break;
            case "get":
                const queryResult = skill.searchSkill(skillQuery);
                message.reply({embeds: [skill.displaySkill(queryResult)]});
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