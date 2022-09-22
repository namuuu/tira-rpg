const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../utils/messageTemplateUtils.js');
const skill = require('../setup/skillSetup.js');

module.exports = {
  name: "test",
  aliases: [],
  description: "",
  requireCharacter: false,
  execute(message, args) {
    authorId = message.author.id;

    //dbUtils.awardExp(authorId, 100, message.channel);
    //dbUtils.giveItem(authorId, "apple", 1);
    //messageTemplateUtils.sendChooseClassSelector(message.channel);

    (skill.map.get("heal"))(-1);
  }
}