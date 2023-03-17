const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const util = require("../../utils/combatUtils.js");
const skillData = require("../../data/skills.json");

module.exports = {
    name: "combat.command",
    interact: async function(interaction, args) {
        if(args.length == 0) {
            interaction.deferUpdate();
            return;
        }

        const combatId = interaction.channelId;
        const combat = await util.getCombatCollection(combatId);

        if(combat == null) {
            interaction.reply({ content: "The combat seems to have been deleted.", ephemeral: true });
            return;
        }

        console.log(args);

        switch (args[0]) {
            case "display":
                switch(args[1]) {
                    case "back":
                        editDisplayer(interaction, "main", combat);
                        break;
                    case "team1":
                        editDisplayer(interaction, "team1", combat);
                        break;
                    case "team2":
                        editDisplayer(interaction, "team2", combat);
                        break;
                    default:
                        if(util.getPlayerInCombat(args[1], combat) != null) {
                            editDisplayer(interaction, "player", util.getPlayerInCombat(args[1], combat));
                        }
                        break;
                }
                break;
            case "full.data":
                const playerId = args[1];
                const player = util.getPlayerInCombat(playerId, combat);

                const skillValue = "";

                for(let i = 0; i < player.skills.length; i++) {
                    const skill = player.skills[i];
                    skillValue += `${skillData[skill].number} - ${skillData[skill].name}\n`;
                }

                if(skillValue == "")
                    skillValue = "No skills";

                const mainEmbed = new EmbedBuilder()
                    .setTitle("Na'vi, your personal combat assistant")
                    .addFields({ name: "Name", value: player.name })
                    .addFields({ name: "Class", value: player.class })
                    .addFields({ name: "Health", value: player.health + "/" + player.stats.vitality })
                    .addFields({ name: "Timeline", value: player.timeline + " Timeline" })
                    .addFields({ name: "Skills", value: skillValue })

                const statEmbed = new EmbedBuilder()
                    .setDescription("The players' stats.")
                    .addFields({ name: "Strength", value: player.stats.strength + "", inline: true })
                    .addFields({ name: "Dexterity", value: player.stats.dexterity + "", inline: true })
                    .addFields({ name: "Resistance", value: player.stats.resistance + "", inline: true })
                    .addFields({ name: "Vitality", value: player.stats.vitality + "", inline: true })
                    .addFields({ name: "Intelligence", value: player.stats.intelligence + "", inline: true })
                    .addFields({ name: "Agility", value: player.stats.agility + "", inline: true })
                
                if(interaction.channel.isThread()) {
                    interaction.user.send({ embeds: [mainEmbed, statEmbed] });
                } else {
                    interaction.message.edit({ embeds: [mainEmbed, statEmbed] });
                }

                break;
        }

        interaction.deferUpdate();
    }
}

async function editDisplayer(interaction, type, combat) {
    const message = interaction.message;

    if(combat == null) {
        combat = util.getCombatCollection(message.channelId);
        if(combat == null)
            return;
    }

    const embed = new EmbedBuilder()
        .setTitle("Na'vi, your personal combat assistant")
        .setDescription("This is the combat displayer. It will display the combat timeline and the combatants.")
        .setFooter({ text: "Use t.combat help for more information" })

        const row = new ActionRowBuilder();

    console.log(type);

    switch(type) {
        case "main":
            embed.setDescription("You can use the buttons below to navigate through the combat displayer.")
            embed.addFields({ name: "Team 1", value: teamDisplay(combat.team1), inline: true });
            embed.addFields({ name: "Team 2", value: teamDisplay(combat.team2), inline: true});
            addButton(row, "Team 1", ButtonStyle.Secondary, "combat.command-display-team1");
            addButton(row, "Team 2", ButtonStyle.Secondary, "combat.command-display-team2");
            break;
        case "team1":
            embed.setDescription("You can use the buttons below to navigate through the combat displayer.")
            for(let i = 0; i < combat.team1.length; i++) {
                embed.addFields({ name: `${i + 1}. ${combat.team1[i].name}`, value: `Timeline: ${combat.team1[i].timeline}` });
                addButton(row, `${i + 1}. ${combat.team1[i].name}`, ButtonStyle.Secondary, `combat.command-display-${combat.team1[i].id}`);
            }
            addButton(row, "Back", ButtonStyle.Secondary, "combat.command-display-back-main");
            break;
        case "team2":
            embed.setDescription("You can use the buttons below to navigate through the combat displayer.")
            for(let i = 0; i < combat.team2.length; i++) {
                embed.addFields({ name: `${i + 1}. ${combat.team2[i].name}`, value: `Timeline: ${combat.team2[i].timeline}` });
                addButton(row, `${i + 1}. ${combat.team2[i].name}`, ButtonStyle.Secondary, `combat.command-display-${combat.team2[i].id}`);
            }
            addButton(row, "Back", ButtonStyle.Secondary, "combat.command-display-back");
            break;
        case "player":
            const player = combat;
            embed.setDescription(`${player.name}'s data.`);

            let skillString = "";
            const skillData = JSON.parse(fs.readFileSync("./data/skills.json", "utf8"));

            embed.addFields({ name: "HP: " + player.health + "/" + player.stats.vitality, value: getHealthBar(player.health, player.stats.vitality) });

            if(player.skills.length == 0)
                skillString = "*No skill currently active.*";
            for(let i = 0; i < player.skills.length; i++) {
                skillString += `${skillData[player.skills[i]].name},`;
            }

            embed.addFields({ name: "Skills:", value: skillString.substring(0, skillString.length - 1) });

            // TODO: ADD STATUSES

            addButton(row, "Get complete data ⭧", ButtonStyle.Secondary, `combat.command-full.data-${player.id}`);
            addButton(row, "Back", ButtonStyle.Secondary, "combat.command-display-back");
    }

    console.log(embed);

    message.edit({ embeds: [embed], components: [row] });
}

function getHealthBar(health, maxHealth) {
    let healthBarNumber = Math.floor((health / maxHealth)*10);
    let healthBar = "";

    if(healthBarNumber > 10) {
        healthBar = "▰▰▰▰▰▰▰▰▰▰";
        healthBar += ` (${health - maxHealth} overhealth)`;
    } else if (healthBarNumber < 0) {
        healthBar = "OUT OF COMBAT";
    } else {
        for(let i = 0; i < healthBarNumber; i++) {
            healthBar += "▰";
        }
    
        for(let i = 0; i < healthBarNumber - 10; i++) {
            healthBar += "▱";
        }
    }
    

    return healthBar;
}   

function teamDisplay(team) {
    let teamDisplay = "";

    for (let i = 0; i < team.length; i++) {
        teamDisplay += `${i + 1}. ${team[i].name} (${team[i].timeline} TL)\n`;
    }

    return teamDisplay;
}

function addButton(row, label, style, customId) {
    row.addComponents(
        new ButtonBuilder()
            .setLabel(label)
            .setStyle(style)
            .setCustomId(customId)
    );
}