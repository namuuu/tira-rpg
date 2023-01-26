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
    let authorId = message.author.id;

    if(args.length > 0)
      authorId = args[0];

    playerUtil.health.set(authorId, 5);
    //console.log(await dbUtils.doesPlayerExists(authorId));
  }
}