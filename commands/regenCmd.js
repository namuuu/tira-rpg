const player = require('../utils/playerUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "regen",
  aliases: [],
  description: "Recover your lost hitpoints.",
  requireCharacter: true,
  async execute(message, args) {
    authorId = message.author.id;

    const returnVal = await player.passiveRegen(authorId);

    const embed = new EmbedBuilder()
      .setColor(0xF898AA)
      .setTimestamp();

    if (returnVal.gainedHealth > 0 || returnVal.gainedEnergy > 0) {
      embed.addFields({name: ":hibiscus: Regeneration", value: `You now have ${returnVal.health} health :heart: (+${returnVal.gainedHealth}) and  ${returnVal.energy} energy :battery: (+${returnVal.gainedEnergy})`});
    }

    if (returnVal.error != null)
      embed.setDescription(returnVal.error);

    message.channel.send({ embeds: [embed] });
  }
}