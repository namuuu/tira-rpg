// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create a new client instance
const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]});

// Setup commands
const { setupCommands } = require('./setup/commandSetup.js');
setupCommands(client, process.env.BOT_TOKEN, process.env.APP_ID);

// Setup events
const { setupEvents } = require('./setup/eventSetup.js');
setupEvents(client);

// Setup Skills
const { setupSkills } = require('./setup/skillSetup.js');
setupSkills(client);

const { setupEquipment } = require('./setup/equipSetup.js');
setupEquipment(client);

const { setupCaracteristics } = require('./setup/caracteristicsSetup.js');
setupCaracteristics(client);

// Setup mongo
Client.client = client;
Client.mongoDB = new MongoClient(process.env.MONGO_URI);


client.once('ready', () => {
  console.log('\u001b[1;32m Tira\'s RPG Bot is ready to execute.' + ' \u001b[0m');

    client.user.setPresence({ activities: [{name: 'Battling'}], status: 'online'});
});

client.login(process.env.BOT_TOKEN);