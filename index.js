// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Create a new client instance
const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]});

const { setup } = require('./setup.js');
setup(client);

// Setup mongo
Client.client = client;
Client.mongoDB = new MongoClient(process.env.MONGO_URI);


client.once('ready', () => {
  console.log('\u001b[1;32mTira\'s RPG Bot is ready to execute.' + ' \u001b[0m');

    client.user.setPresence({ activities: [{name: 'Battling'}], status: 'online'});
});

client.login(process.env.FIR_SHARD);