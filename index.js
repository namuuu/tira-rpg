// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Setup commands
const { setupCommands } = require('./setup/commandSetup.js');
setupCommands(client);

// Setup events
const { setupEvents } = require('./setup/eventSetup.js');
setupEvents(client);

// Setup Skills
const { setupSkills } = require('./setup/skillSetup.js');
setupSkills(client);

// Setup mongo
Client.mongoDB = new MongoClient(process.env.MONGO_URI);


client.once('ready', () => {
  console.log('\u001b[1;32m Tira\'s RPG Bot is ready to execute.' + ' \u001b[0m');

    client.user.setPresence({ activities: [{name: 'Battling'}], status: 'online'});
});

client.login(process.env.BOT_TOKEN);