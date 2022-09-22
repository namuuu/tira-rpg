const skillData = require("../setup/skillSetup.js");


module.exports = {
  execute(skillName, channel, combat, quantity) {
    return (skillData.map.get(skillName))(channel, combat, quantity);
  },
  get(skillName) {
    return skillData.map.get(skillName);
  }
}