const { Client, MessageEmbed, SlashCommandBuilder } = require('discord.js');

/**
 * Creates a thread from a message
 * @param message the message to create a thread from
 * @returns the created thread
 */
exports.createThread = async function(message) {
    const thread = await message.startThread({
        name: 'name',
        autoArchiveDuration: 60,
        reason: 'reason',
    });

    return new Promise(async resolve => {
        resolve(thread);
    });
}

/**
 * Deletes a thread (note: only works if the channel the command is called in is a thread)
 * @param channel the thread to delete
 */
exports.deleteThread = async function(channel) {
    if(channel.isThread()) {
        channel.delete();
        return;
    } else {
        channel.send("It doesn't seem like a thread...");
        console.log("[DEBUG] Attempted to delete a non-thread channel. (NON_THREAD_CHANNEL_DELETE_ATTEMPT)")
    }
}

/**
 * Instanciates a combat in the database, note that the data is currently blank.
 * @param messageId message id that will serve as the combat id. also is the id of the thread.
 * @returns the id in question.
 */
exports.instanciateCombat = async function(messageId) {
    const combatCollection = Client.mongoDB.db('combat-data').collection(messageId);

    const combatData = [
        {
            zone: null,
            current_turn: 0,
            current_timeline: 0,
            current_action: {
                current_player_id: null,
                aim_at: null,
                skill: null, 
            },
            team1: [],
            team2: [],
        }
    ];

    const options = { ordered: true };


    return new Promise(async resolve => {
        const result = await combatCollection.insertMany(combatData, options)
        resolve(messageId);
    });
}

exports.joinFight = async function(playerId, messageId, team) {
    const combatCollection = await this.getCollection(messageId);

    if(combatCollection == null) {
        console.log("[DEBUG] Attempted to join a non-existent combat. (NON_EXISTENT_COMBAT_JOIN_ATTEMPT)");
        return;
    } 

    const info = await combatCollection.findOne({}, {_id: 0});

    console.log(info);
    
    
}

exports.getCollection = async function(messageId) {
    const combatDatabase = Client.mongoDB.db('combat-data');

    return new Promise(async resolve => {
        combatDatabase.listCollections({name: messageId}).toArray(function(err, collections) {
            if(collections.length > 0) {
                resolve(collections[0]);
            } else {
                resolve(null);
            }
        })
    });
}