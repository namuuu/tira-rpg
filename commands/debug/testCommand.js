const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");
const { interact } = require("../../interactions/buttons/discussionButton.js");
const discussion = require("../../utils/discussionUtils.js");

module.exports = {
  name: "test",
  aliases: [],
  description: "Test command",
  requireCharacter: false,
  async execute(message, args) {
    
   /*const mainEmbed = new EmbedBuilder()
      .setTitle("What is Tira's RPG Bot?")
      .setDescription("Tira's RPG is a discord bot that aims to provide a great experiences around an entire game that fits in the code of a simple discord bot. This adventure will contain a variety of armors, skills, items and activities to discover. As we implement new features frequently, we want to keep your perception of the game as fresh as possible, always having something new to do.\n\nHere's some cool features:")
      .addFields(
         { name: "A cool Battle System", value: "Fight against a wide variety of enemies and bosses. This journey will be full of surprises!"},
         { name: "A Skill System", value: "You can acquire different skills that will help you in your journey. Use the right ones against the right enemies to maximize your efficiency!"},
         { name: "A huge variety of amors and weapons", value: "Tira has a lot of armors and weapons to choose from. Choosing the right skills may be not enough, you may want to seek the perfect gear to complete your build!"},
         { name: "And more!", value: "We want to make a lot of cool stuff with Tira, so please bear with us! Thank you so much for playing our game!"}
      )
      .setFooter({text: "We started developing this project seriously on 23/03/2022."})

   const contributorEmbed = new EmbedBuilder()
         .setTitle("Contributors")
         .setDescription("All the cool people that helped us make this bot possible:")
         .addFields(
            {name: "Namu", value: "Main Developer, and awesome guy (im actually the one writing this...)"},
            {name: "Firquen", value: "Main Developer, backbone of the nice ambiance in the team!"},
            {name: "Rowx", value: "Main Developer, he's just cool af, what can we say"},
            {name: "Canfrixe", value: "Developer"},
            {name: "Viixyy", value: "Game Designer, you can thank him, he helped us a lot on game design!"},
            {name: "Nekotaku", value: "Game Designer, he also brought a lot of cool ideas to the table!"}
         )

      const row = new ActionRowBuilder()
         .addComponents(
            new ButtonBuilder()
               .setLabel("Invite the Tira's RPG Bot")
               .setURL("https://discord.com/oauth2/authorize?client_id=681074990925479938&permissions=397891677377&scope=bot")
               .setStyle(ButtonStyle.Link)
         )
      
      message.channel.send({ embeds: [mainEmbed, contributorEmbed], components: [row] });*/

      //discussion.send(message.author, message.channel, "welcome_capital", "welcome_capital_1");
      discussion.send(message.author, message.channel, "choice", "ask");
  }
}



const levenshteinDistance = (str1 = '', str2 = '') => {
  const track = Array(str2.length + 1).fill(null).map(() =>
  Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
     track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
     track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
     for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
           track[j][i - 1] + 1, // deletion
           track[j - 1][i] + 1, // insertion
           track[j - 1][i - 1] + indicator, // substitution
        );
     }
  }
  return track[str2.length][str1.length];
};