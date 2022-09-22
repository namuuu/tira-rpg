const { Client, MessageEmbed } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../utils/messageTemplateUtils.js');
const skill = require('../utils/skillUtils.js');

module.exports = {
<<<<<<< HEAD
  name: "test",
  aliases: [],
  description: "",
  requireCharacter: false,
  execute(message, args) {
    authorId = message.author.id;

    //dbUtils.awardExp(authorId, 100, message.channel);
    //dbUtils.giveItem(authorId, "apple", 1);
    //messageTemplateUtils.sendChooseClassSelector(message.channel);

    skill.execute("heal");
  }
=======
    name: "test",
    aliases: [],
    description: "",
    requireCharacter: false,
    execute(message, args) {
        console.log(message);
    }
>>>>>>> origin/main
}