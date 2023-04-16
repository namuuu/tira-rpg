const { EmbedBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const equip = require("../utils/equipUtils.js");
const equipData = require("../setup/equipSetup.js");


module.exports = {
    name: "equip",
    aliases: ["eq"],
    description: "All the commands related to equipments.",
    requireCharacter: true,
    execute(message, args) {
        if(args.length == 0) {
            displayHelp(message.channel);
            return;
        }

        switch(args[0]) {
            case "h":
            case "help":
                displayHelp(message.channel);
                break;
            case "display":
                if(args.length < 2) {
                    displayError(message.channel, "Please specify the name of the equipment you want to display.");
                    return;
                }

                for(let i = 2; i < args.length; i++)
                    args[1] += " " + args[i];

                const solutions = equip.leveinsteinSearch(args[1], equipData.equipmentList);
                if(solutions.length == 0) {
                    displayError(message.channel, "No equipment found with this name.");
                    return;
                }
                console.log(solutions[0].lev);
                if(solutions.length == 1) {
                    message.channel.send({ embeds: [equip.getEquipData(solutions[0].equip)] });
                    return;
                }
                if(solutions.length > 5)
                    solutions.length = 5;
                
                const embed = new EmbedBuilder()
                    .setDescription("There's multiple equipments with this name. Please select the one you want to display.")

                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("equip-display")
                            .setPlaceholder("Select an equipment")
                    )

                for(const solution of solutions) {
                    row.components[0].addOptions(
                        {
                            label: solution.equip.name,
                            value: solution.equip.id,
                            description: solution.equip.description
                        }
                    )
                }

                message.channel.send({ embeds: [embed], components: [row] });
                
                break;
            default:
                displayError(message.channel, "Unknown command. Type `t.equip help` to see all the commands");
        }
    }
}

function displayError(channel, error) {
    const embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(error)
        .setColor(0xFF0000)

    channel.send({ embeds: [embed] });
}

function displayHelp(channel) {
    const embed = new EmbedBuilder()
        .setTitle("Equipments")
        .setDescription("Equipments are items that can be equipped by your character. They can be weapons, armors, accessories, etc. They can be bought from the shop, or found in quests. Equipments can be upgraded to increase their stats.")
        .addFields(
            { name: "t.equip list", value: "Displays all the equipments you have.", inline: true },
            { name: "t.equip display", value: "Displays a specific equipment.", inline: true },

            { name: "Need more info?", value: "Check out our [Gitbook](https://tira-rpg.gitbook.io/tira-quest/command/equip)!"}
        )

    channel.send({ embeds: [embed] });
}
