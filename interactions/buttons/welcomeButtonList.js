const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const classData = require('../../data/classes.json');

module.exports = {
    name: "welcome",
    interact: async function(interaction, args) {
        if(args[1] != interaction.user.id) {
            interaction.deferUpdate();
            return;
        }

        const author = interaction.user;
        const embed = new EmbedBuilder();
        const button = new ActionRowBuilder();

        switch(args[0]) {
            case "0":
                embed
                    .setTitle(":crossed_swords: Our world")
                    .setDescription("First thing first, I need to introduce you to Orialla's world. It is one with many creatures and dungeons, vast landscapes and many mysteries around it. While I prefer to not reveal everything about it (that would ruin the fun of it!), you can read our base lore in our [gitbook](https://tira-rpg.gitbook.io/tira-quest/lore/introduction).")
                    .addFields({name: "How can I learn even more about Orialla?", value: "Many hints are designed in-game so you can learn about it while progressing!"},
                               {name: "What is the goal of the game?", value: "We do not value an adventure who has a finite goal, as the best adventure should never end, right? Explore as much as you can, discover every bit of this universe, there will always be something else to discover!"})
                    .setColor(0xFF7F50)

                
                    button.addComponents(
                        new ButtonBuilder()
                            .setCustomId("welcome-1-" + interaction.user.id)
                            .setLabel("Continue")
                            .setStyle(ButtonStyle.Secondary)
                    )

                interaction.update({embeds: [embed], components: [button]});
                break;
            case "1":
                embed
                    .setTitle(":crossed_swords: Our wiki")
                    .setDescription("We use gitbook to store any relevant information about the game. You can find it [here](https://tira-rpg.gitbook.io/tira-quest/).")
                    .setColor(0xFF7F50)
                    .addFields(
                        {name: "There's something I still don't understand", value: "If you have any question or issue, you can always ask for help in our [support server](https://discord.gg/y5A93HkPmS)."},
                        {name: "Is there any tutorial?", value: "We do not have any tutorial yet, but you can check out the [Beggining your journey](https://tira-rpg.gitbook.io/tira-quest/lore/beginning-your-journey) page to get a better understanding of the game!"}
                    )

                    button.addComponents(
                        new ButtonBuilder()
                            .setCustomId("welcome-2-" + interaction.user.id)
                            .setLabel("Continue")
                            .setStyle(ButtonStyle.Secondary)
                    )

                interaction.update({embeds: [embed], components: [button]});
                break;
            case "2":
                embed
                    .setTitle(":crossed_swords: The final step")
                    .setDescription("You're almost ready to go! Before you can start your adventure, you need to choose a class using the selection menu below!")
                    .setColor(0xFF7F50)
                    .addFields(
                        {name: "What is a class?", value: "A class is a set of statistics and abilities that will define your character. You can find more information about them in the [Classes](https://tira-rpg.gitbook.io/tira-quest/lore/classes) page."},
                    )

                    list = [];

                    for(const [className, classInfo] of Object.entries(classData)) {
                        list.push({
                            label: classInfo.name,
                            value: className,
                            description: classInfo.description
                        });
                    }

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('classChoice-' + author.id)
                                .setPlaceholder('Nothing selected')
                                    .addOptions(
                                    list
                                ),
                        );

                    interaction.update({embeds: [embed], components: [row]});
        }
    }
}