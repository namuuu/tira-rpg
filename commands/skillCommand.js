const { EmbedBuilder } = require("discord.js");
const util = require("../utils/skillUtils.js");

module.exports = {
  name: "skill",
  aliases: [],
  description: "Get information about different skills!",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a subcommand!");
        return;
    }

    // Checks the first argument, considered as the "debug command"
    switch(args[0]) {
        case "search":
            if(args.length < 2) {
                message.reply("Please specify a skill name!");
                return;
            }
            const { name: id, skill } = util.searchSkill(args.slice(1).join(" "));
            if(id == null) {
                message.reply("Skill not found!");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("#" + skill.number + " - "  + skill.name)
                .setDescription(skill.description)

            switch(skill.aim) {
                case "self":
                    embed.addFields({name: "Target", value: "Self"});
                    break;
                case "enemy-single":
                    embed.addFields({name: "Target", value: "Single Enemy"});
                    break;
                case "enemy-aoe":
                    embed.addFields({name: "Target", value: "All Enemies"});
                    break;
                case "ally-single":
                    embed.addFields({name: "Target", value: "Single Ally"});
                    break;
                case "ally-aoe":
                    embed.addFields({name: "Target", value: "All Allies"});
                    break;
                case "ally+self-single":
                    embed.addFields({name: "Target", value: "Any Ally or Self"});
                    break;
                case "ally+self-aoe":
                    embed.addFields({name: "Target", value: "All Allies and Self"});
                    break;
                default:
                    embed.addFields({name: "Target", value: "Unknown"});
                    break;
            }

            message.reply({ embeds: [embed] });
        break;

    }
    

    return;
  }
}

