const skillEffect = require("../setup/skillSetup.js");
const skills = require("../data/skills.json");
const { EmbedBuilder } = require('discord.js');


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
    },
    searchSkill(query) {
        if(!isNaN(query)) {
            // The string contains a number
            for(const skill in skills) {
                if (skills[skill].number == query)
                    return skills[skill];
            }
        } else {
            // The string does not contain a number
            for(const skill in skills) {
                if(skill == query)
                    return skills[skill];
            }
        }
    },
    displaySkill(skill) {
        return new EmbedBuilder()
            .setTitle(`#${skill.number} - ${skill.name}`)
            .setDescription(`${skill.description}`)
            .setColor(0x0099FF)
        
    }
}