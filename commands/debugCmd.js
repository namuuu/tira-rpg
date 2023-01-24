const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../utils/messageTemplateUtils.js');
const skill = require('../utils/skillUtils.js');

module.exports = {
  name: "debug",
  aliases: [],
  description: "Debug command. Usage for developer only.",
  requireCharacter: true,
  execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const authorId = message.author.id;

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "learn-skill":
                if(args.length == 2)
                    dbUtils.learnSkill(authorId, args[1]);
                else
                    dbUtils.learnSkill(authorId, "debugger");
                break;
            case "unlearn-skill":
                if(args.length == 2)
                    dbUtils.unlearnSkill(authorId, args[1]);
                else
                    dbUtils.unlearnSkill(authorId, "debugger");
                break;
            case "select-skill":
                if(args.length == 2)
                    dbUtils.selectActiveSkill(authorId, args[1]);
                else
                    dbUtils.selectActiveSkill(authorId, "debugger");
                break;
            case "unselect-skill":
                if(args.length == 2)
                    dbUtils.unselectSkill(authorId, args[1]);
                else
                    dbUtils.unselectSkill(authorId, "debugger");
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