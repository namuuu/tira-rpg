const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../utils/messageTemplateUtils.js');
const skill = require('../utils/skillUtils.js');

module.exports = {
  name: "Debug",
  aliases: [],
  description: "Debug command. Usage for developer only.",
  requireCharacter: true,
  execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Flag to indicate if the debug is succesful or not.
    let debugIssue = null;

    // Checks the first argument, considered as the "debug command"
    switch(args[0]) {
        case "giveskill":
            debugIssue = dbUtils.learnSkill(authorId, "baguette");
            break;


        default:
            message.reply("Debug Command not found. Please specify a debug command according to the document.");
            break;
    }

    if(debugIssue == true)
        message.reply("Debug command issued succesfully.");

    if(debugIssue == false)
    message.reply("Something went wrong during debug command.");

    return;
  }
}