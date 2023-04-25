const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const player = require('../utils/playerUtils');

module.exports = {
  name: "delete-my-character",
  aliases: [],
  description: "",
  async execute(message, args) {
    var userId = message.author.id;

    if(await player.doesExists(userId)) {
      const embed = new EmbedBuilder()
        .setColor('F08080')
        .setAuthor({name: 'Are you sure you want to delete your character?'})
        .setDescription('This action is irreversible.')

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('delete_character_confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Danger));

      message.reply({embeds: [embed], components: [row]});
    } else {
      const failEmbed = new EmbedBuilder()
        .setColor('F08080')
        .setDescription('You don\'t have a character to delete.')
        .setFooter({text: 'Use the command t.begin to create one.'});

      const reply = message.reply({embeds: [failEmbed]});

      setTimeout(() => {
        message.delete();
        reply.then(msg => msg.delete());
      }
      , 5000);
    }
  }
}