const { EmbedBuilder } = require("discord.js");
const util = require("../utils/abilityUtils.js");

module.exports = {
  name: "ability",
  aliases: ["abi", "abilities"],
  description: "Get information about different abilities!",
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
                message.reply("Please specify a ability name!");
                return;
            }
            const { name: id, ability } = util.searchAbility(args.slice(1).join(" "));
            if(id == null) {
                message.reply("Ability not found!");
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle("#" + ability.number + " - "  + ability.name)
                .setDescription(ability.description)

            switch(ability.aim) {
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

