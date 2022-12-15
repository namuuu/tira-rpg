const skillEffect = require("../setup/skillSetup.js");
const skills = require("../data/skills.json");


module.exports = {
  execute(skillName, channel, combat) {
    const skillEffectList = skills[skillName]["effects"];
    console.log(typeof skillEffectList);
    for(const effect of Object.entries(skillEffectList)) {
      skillEffect.map.get(effect[0])(channel, combat, effect[1]);
    }
    //return (skillEffect.map.get(skillName))(channel, combat, quantity);
  },
  getSkill(skillName) {
    return skills[skillName];
  },
  getEffect(skillEffect) {
    return skillEffect.map.get(skillName);
  }
}