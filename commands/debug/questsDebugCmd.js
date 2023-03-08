const quest = require('../../utils/questUtils.js');

module.exports = {
  name: "debug-quest",
  aliases: [],
  description: "Debug command concerning quests. Usage for developer only.",
  requireCharacter: true,
  async execute(message, args) {
    if(args.length == 0) {
        message.reply("Please specify a debug command according to the document.");
        return;
    }

    // Setting up useful data
    const author = message.author;
    const authorId = author.id;
    
    // Checks the first argument, considered as the "debug command"
    try {
        switch(args[0]) {
            case "getName":
                if(args[1] != null)
                    message.reply(quest.getName(args[1])+ " ");
                else
                    message.reply("Quest's name required.");
                break;

            case "getDescription":
                if(args[1] != null)
                   message.reply(quest.getDescription(args[1])+ " ");
                else
                    message.reply("Quest's name required.");
                break;

            case "getRewards":
                if(args[1] != null){
                    if(quest.getRewards(args[1]).length == 0 ){
                        message.reply("Quest without rewards");
                    }else{
                        let rewards=""
                        for (let i = 0; i < quest.getRewards(args[1]).length; i++) {
                            if(i==0){
                                rewards+=`${ quest.getRewards(args[1])[0]}`
                            }else{
                                rewards+=`, ${quest.getRewards(args[1])[i]}`
                            }
                        }
                        rewards+="."
                        message.reply(rewards+ " ");
                    }             
                }     
                else{
                    message.reply("Quest's name required.");
                }
                   
                break;

        case "getNextQuest":
                if(args[1] != null)
                   message.reply(quest.getNextQuest(args[1])+ " ");
                else
                    message.reply("Quest's name required.");
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