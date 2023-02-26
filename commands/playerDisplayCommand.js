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

        if(args.length == 0) {
            ret = await inv.typeMain(embed, author.id);
        } else {
            switch(args[0]) {
                case "items":
                    ret = await inv.typeItems(embed, author.id);
                    break;
                case "skills":
                    ret = await inv.typeSkills(embed, author.id);
                    break;
                case "stats":
                    ret = await inv.typeStats(embed, author.id);
                    break;
                default:
                    ret = await inv.typeMain(embed, author.id);
                    break;
            }
        }

        var row = new ActionRowBuilder();
        row.addComponents(inv.addSlider(author.id));

        console.log(ret);

        message.channel.send({ embeds: [ret.embed], components: [row] });
    }
}