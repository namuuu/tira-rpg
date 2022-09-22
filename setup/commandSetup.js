const fs = require('fs');
const { Collection } = require('discord.js');


module.exports = {
  setupCommands(client) {
    console.log("-- COMMANDS --")
    client.commands = new Collection(); 
    // Get every JS command file
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    // Setup a new collection for the commands
    for (const file of commandFiles) {
      console.log(`Loading command: ${file}`);
      const command = require(`./../commands/${file}`);
      // Set a new item in the Collection
      // With the key as the command name and the value as the exported module
      client.commands.set(command.name, command);
      if(!command.aliases)
        continue;

      for (const alias of command.aliases) {
        console.log(`- Loading alias: ${alias}`);
        client.commands.set(alias, command);
      }
    }
  }
}