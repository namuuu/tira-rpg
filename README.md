# Tira's RPG

## Intro

Tira's RPG is a discord bot that aims to provide a great experiences around an entire game that fits in the code of a simple discord bot. This adventure will contain a variety of armors, skills, items and activities to discover. As we implement new features frequently, we want to keep your perception of the game as fresh as possible, always having something new to do.

## Inviting Tira's RPG to your server

As the bot is currently in development, you currently cannot add the bot to your server. We want to assure your first experience of it to be as good as possible before going into a private testing phase.

## Installing the Bot's project (Windows)

### Pre-requirements

1. Node Package Manager (https://nodejs.org/en/)

Type `node -v` to make sure it's installed

2. Git (https://git-scm.com/downloads)

Type `git --version` to make sure it's installed

### Cloning the project

Open a Command Prompt wherever you want the bot's project files to be installed. Once there, type :
```
git clone https://github.com/namuuu/tira-rpg.git
```

### Installing packages

Some packages are required in order for the bot to work. Make sure the Command Prompt is in the correct folder (named by default tira-rpg), and type :

```
npm init -y
npm install discord.js
npm install mongodb@4.10
```

### Setting up the different tokens

Create a file called `.env` in the project's parent folder. This file will contain tokens both for the discord bot account, and to login into the MongoDB database.
> We will note provide you this file, as leaking those information would just enable everyone to run code onto our bot. If you want to try it out, please use your own bot application.

This file follows the following pattern :
```
BOT_TOKEN = <BOT_TOKEN HERE>
MONGO_URI = <MONGO_URI HERE>
```

### Actually running the bot
In the bot's parent folder, run `node ./` to launch the bot. If you see `Tira's RPG is ready to work into the Command Prompt`, you're all set up !

# Common Errors / FAQ

### Cannot find module 'node:events'

Your node.js version is probably outdated. Node.js needs to be at least 16.6.0 for discord.js. Please reinstall it from the link used in the "Pre-requirements" section.

### Cannot find module 'dotenv'

In the root folder, run

```
npm install dotenv
```

### MongoServerSelectionError: connect ETIMEDOUT

As for our testing, your internet provider most likely blocks your BDD requests, causing them to never return. 

### TypeError: Cannot read properties of undefined (reading 'Guilds')

Your discord.js version is outdated (Needed version is at least discordjs v14). Please reinstall it with `npm install discord.js@^14.0.2`

# Contributors

| User | Role |
| --- | --- |
| Namu | Head Developer |
| Firquen | Head Developer |
| Roxyrooky | Developer |
| Canfrixe | Developer |
| Az' | Game Designer |
