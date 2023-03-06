const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const player = require('../../utils/playerUtils.js');
const inventory =  require('../../utils/inventoryUtils.js');
const rpg = require('../../utils/rpgInfoUtils.js');
const messageTemplateUtils = require('../../utils/messageTemplateUtils.js');
const skill = require('../../utils/skillUtils.js');

module.exports = {
  name: "test",
  aliases: [],
  description: "Test command",
  requireCharacter: false,
  async execute(message, args) {
    player.exp.award(message.author.id, 50, message.channel);
  }
}