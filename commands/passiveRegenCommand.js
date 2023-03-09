const player = require('../utils/playerUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "regen",
  aliases: [],
  description: "Recover your lost hitpoints.",
  requireCharacter: true,
  execute(message, args) {
    authorId = message.author.id;

    const health = player.health.passiveRegen(message.author.id);
    const energy = player.energy.passiveRegen(message.author.id);

    const displayEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(':white_check_mark: Passive Regeneration :white_check_mark:')
      .addFields(
        { name: 'Health recovered', value: health },
        { name: 'Energy recovered', value: energy }
      )
      .setThumbnail(message.author.displayAvatarURL());

    message.channel.send({ embeds: [displayEmbed] });
  }
}