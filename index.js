// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
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

// Prevents a weird node warning
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

client.once('ready', () => {
  console.log('\u001b[1;32mTira\'s RPG Bot is ready to execute.' + ' \u001b[0m');

  const statuses = [
    'New to the game? Type t.help !',
    'Currently in Beta!',
  ]

  client.user.setActivity("Starting...", { type: ActivityType.Playing });

  let i = 0;
  setInterval(() => {
    client.user.setActivity(statuses[i], { type: ActivityType.Playing });
    i = ++i % statuses.length;
  }, 10000);
});

client.login(process.env.BOT_TOKEN);