const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const dbUtils = require('../../utils/databaseUtils.js');
const rpgInfoUtils = require('../../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../../utils/messageTemplateUtils.js');
const skill = require('../../utils/skillUtils.js');

module.exports = {
  name: "test",
  aliases: [],
  description: "Test command",
  requireCharacter: false,
  execute(message, args) {
    authorId = message.author.id;

    message.reply("hey");

    //dbUtils.awardExp(authorId, 100, message.channel);
    //dbUtils.giveItem(authorId, "apple", 1);
    //messageTemplateUtils.sendChooseClassSelector(message.channel);

    //dbUtils.learnSkill(authorId, "baguette");

    skill.execute("baguette", message.channel, "combatId");
  }
}