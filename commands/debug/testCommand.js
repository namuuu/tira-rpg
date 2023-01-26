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
  async execute(message, args) {
    console.log("heho ?");
    dbUtils.levelUp(message.author.id, args[0]);
  }
}