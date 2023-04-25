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

    console.log(returnVal);

    const embed = new EmbedBuilder()
      .setColor(0xF898AA)

    let field = "";

    if (returnVal.health > 0 || returnVal.energy > 0) {
      

      if (returnVal.gainedHealth > 0)
        field += `• ${returnVal.health} HP (+${returnVal.gainedHealth})\n`;

      if (returnVal.gainedEnergy > 0)
        field +=  `• ${returnVal.energy} energy (+${returnVal.gainedEnergy})\n`;
    }

    if (returnVal.error != null)
      embed.setDescription(returnVal.error);

    if (field != "")
      embed.addFields({ name: " :hibiscus: Passive Regeneration", value: field })

    message.channel.send({ embeds: [embed] });



  //   player.health.passiveRegen(message.author.id).then(health => {
  //     player.energy.passiveRegen(message.author.id).then(energy => {
  //       player.getData(authorId, "info").then(info => {

  //       var actualHealth = info.health;
  //       var actualEnergy = info.energy;

  //       const embed = new EmbedBuilder()
  //         .setTitle(" :hibiscus: Passive Regeneration :hibiscus:")
  //         .setDescription("You have recovered " + health + " health :heart: and " + energy + " energy :battery:")
  //         .setColor(0xF898AA)
  //         .setFooter({text: "You now have " + actualHealth + " health and " + actualEnergy + " energy."})
  //         .setTimestamp();

  //       message.channel.send({ embeds: [embed] });
  //     })
  //   })
  // })
  }
}