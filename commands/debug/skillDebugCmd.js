const skill = require('../../utils/skillUtils.js');

module.exports = {
  name: "debug-skill",
  aliases: [],
  description: "Debug command concerning skills. Usage for developer only.",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const authorId = message.author.id;
    let skillQuery = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    if(args.length > 1)
        skillQuery = args.slice(1).join(" ");

    var id, skillSearched;

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "learn":
                var {name: id, skill: skillSearched} = skill.searchSkill(skillQuery);
                if(id == null) {
                    message.reply("Skill not found. Please specify a valid skill name.");
                    return;
                }
                skill.learnSkill(authorId, id);
                break;
            case "unlearn":
                var {id, skillSearched} = skill.searchSkill(skillQuery);
                if(id == null) {
                    message.reply("Skill not found. Please specify a valid skill name.");
                    return;
                }
                skill.unlearnSkill(authorId, id);
                break;
            case "select":
                var {id, skillSearched} = skill.searchSkill(skillQuery);
                if(id == null) {
                    message.reply("Skill not found. Please specify a valid skill name.");
                    return;
                }
                skill.selectActiveSkill(authorId, id);
                break;
            case "unselect":
                var {id, skillSearched} = skill.searchSkill(skillQuery);
                if(id == null) {
                    message.reply("Skill not found. Please specify a valid skill name.");
                    return;
                }
                skill.unselectActiveSkill(authorId, id);
                break;
            case "test": {
                await skill.learnSkill(authorId, "slash");
                await skill.selectActiveSkill(authorId, "slash");
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