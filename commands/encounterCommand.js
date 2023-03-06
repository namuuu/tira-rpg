const player = require('../utils/playerUtils.js');
const combatManager = require('../manager/combatManager.js');

module.exports = {
  name: "encounter",
  aliases: [],
  description: "Search for an encounter, beware not to attack too strong of an enemy!",
  requireCharacter: true,
  execute(message, args) {
    combatManager.instanciateCombat(message, message.author);
  }
}