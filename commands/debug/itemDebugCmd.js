const invDb = require('../../utils/databaseUtils');

module.exports = {
  name: "debug-inv",
  aliases: [],
  description: "Debug command concerning the inventory system. Usage for developer only.",
  requireCharacter: true,
  execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const authorId = message.author.id;
    let query = "baguette";
    if(args.length >= 2)
        query = args[1]

    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "give":
                invDb.giveItem(authorId, query, 1);
                break;
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