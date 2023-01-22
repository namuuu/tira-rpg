const dbUtils = require('../../utils/databaseUtils.js');
const skill = require('../../utils/skillUtils.js');

module.exports = {
  name: "debug-equip",
  aliases: [],
  description: "Debug command concerning equipments. Usage for developer only.",
  requireCharacter: true,
  execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const authorId = message.author.id;
    let query = 10;
    if(args.length >= 2)
        query = parseInt(args[1]);

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            default:
                message.reply("Debug Command not found. Please specify a debug command according to the document.");
                break;
        }
    } catch (error) {
        console.log(error);
    }
    

    return;
  }
}