const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const inv = require('../utils/inventoryUtils.js');


module.exports = {
    name: "display",
    aliases: [],
    description: "",
    requireCharacter: true,

    async execute(message, args) {
        const author = message.author;
        
        var embed = new EmbedBuilder();
        embed.setAuthor({name: "Inventory of " + author.username, iconUrl: author.avatarURL});

        const buttons = new ActionRowBuilder();

        if(args.length == 0) {
            ret = await inv.typeMain(embed, author.id);
        } else {
            switch(args[0]) {
                case "items":
                    ret = (await inv.typeItems(embed, author.id)).embed;
                    break
                case "skills":
                    ret = (await inv.typeSkills(embed, author.id));
                    buttons.addComponents(ret.components);
                    ret = ret.embed;
                    break;
                case "stats":
                    ret = (await inv.typeStats(embed, author.id)).embed;
                    break;
                default:
                    ret = (await inv.typeMain(embed, author.id)).embed;
                    break;
            }
        }

        var row = new ActionRowBuilder();
        row.addComponents(inv.addSlider(author.id));

        const componentList = [];

        componentList.push(row);


        message.channel.send({ embeds: [ret], components: [row] });
    }
}