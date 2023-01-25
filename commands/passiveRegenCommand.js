const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');
const dbUtils = require('../utils/databaseUtils.js');

module.exports = {
  name: "regen",
  aliases: [],
  description: "Recover your lost hitpoints.",
  requireCharacter: true,
  execute(message, args) {
    authorId = message.author.id;

    dbUtils.passiveRegen(authorId).then(nb => {
        message.reply("Recovered HPs : " + nb);
    });

    
  }
}