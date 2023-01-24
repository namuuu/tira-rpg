const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');
const rpgInfoUtils = require('../utils/rpgInfoUtils.js');
const messageUtils = require('../utils/messageTemplateUtils.js');
const skill = require('../utils/skillUtils.js');

module.exports = {
  name: "test-selector",
  aliases: [],
  description: "Test command",
  requireCharacter: false,
  execute(message, args) {
    dbUtils.learnSkill(authorId, "baguette");

    skill.execute("baguette", message.channel, "combatId");
  }
}