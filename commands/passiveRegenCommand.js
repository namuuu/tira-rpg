const player = require('../utils/playerUtils.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "regen",
  aliases: [],
  description: "Recover your lost hitpoints.",
  requireCharacter: true,
  execute(message, args) {
    authorId = message.author.id;

    

    player.health.passiveRegen(message.author.id).then(health => {
      player.energy.passiveRegen(message.author.id).then(energy => {
        player.getData(authorId, "info").then(info => {

        var actualHealth = info.health;
        var actualEnergy = info.energy;

        const embed = new EmbedBuilder()
          .setTitle(" :hibiscus: Passive Regeneration :hibiscus:")
          .setDescription("You have recovered " + health + " health :heart: and " + energy + " energy :battery:")
          .setColor(0xF898AA)
          .setFooter({text: "You now have " + actualHealth + " health and " + actualEnergy + " energy."})
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      })
    })
  })
}
}