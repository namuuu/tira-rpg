const player = require('../utils/playerUtils.js');

module.exports = {
  name: "regen",
  aliases: [],
  description: "Recover your lost hitpoints.",
  requireCharacter: true,
  execute(message, args) {
    authorId = message.author.id;

    player.health.passiveRegen(authorId).then(nb => {
        message.reply("Recovered HPs : " + nb);
    });

    
  }
}