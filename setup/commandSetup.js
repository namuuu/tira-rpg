const fs = require('fs');
const { Collection, SlashCommandBuilder } = require('discord.js');
const { commandFolders } = require("../config.json");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


module.exports = {
  setupCommands(client, token, APP_ID) {
    //console.log(commandFolders);
    console.groupCollapsed("-- Commands --");
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
      /*new SlashCommandBuilder()
        .setName(command.name);*/

      if(!command.aliases)
        continue;

      for (const alias of command.aliases) {
        console.log(`- Loading alias: ${alias}`);
        client.commands.set(alias, command);
        /*new SlashCommandBuilder()
          .setName(alias);*/
      }
    }

    for(const folder of commandFolders) {
      const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
      // Setup a new collection for the commands
      for (const file of commandFiles) {
        console.log(`Loading command: /${folder}/${file}`);
        const command = require(`./../commands/${folder}/${file}`);
        // Set a new item in the Collection
        // With the key as the command name and the value as the exported module
        client.commands.set(command.name, command);
        /*new SlashCommandBuilder()
          .setName(command.name);*/

        if(!command.aliases)
          continue;

        for (const alias of command.aliases) {
          console.log(`- Loading alias: ${alias}`);
          client.commands.set(alias, command);
          /*new SlashCommandBuilder()
            .setName(alias);*/
        }
      }
    }

    /*console.log(APP_ID);
    console.log(typeof(APP_ID));

    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
      try {
        console.log('Started refreshing application (/) commands.');
    
        await rest.put(Routes.applicationCommands(APP_ID), {
          body: client.commands,
        });
    
        console.log('Successfully reloaded application (/) commands.');
      } catch (error) {
        console.error(error);
      }
    })();*/
    console.groupEnd();
  }
}