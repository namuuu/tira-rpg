const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const playerUtil = require('../../utils/playerUtils.js');
const rpgInfoUtils = require('../../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../../utils/messageTemplateUtils.js');
const skill = require('../../utils/skillUtils.js');

module.exports = {
  name: "test",
  aliases: [],
  description: "Test command",
  requireCharacter: false,
  async execute(message, args) {
  }
}