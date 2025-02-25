const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const TOKEN = process.env.DISCORD_TOKEN;
const BASE_URL = process.env.VUE_APP_BASE_URL_HANS ? process.env.VUE_APP_BASE_URL_HANS : "https://dion-avatar-backend.onrender.com"
const API_ENDPOINT = BASE_URL + "/fetch_agent_output";

const allowedChannels = [
    '1341191250266554500',
];




client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
    console.log("messageCreate event triggered");
    console.log("message received: ", message.content);

    if (!allowedChannels.includes(message.channel.id)) {
        console.log("Ignoring message from channel:", message.channel.id);
        return;
    }

    if (message.author.bot) {
        console.log("Message from bot, ignoring.");
        return;
    }

    try {
        // Fetch the last 100 messages from the channel
        const messages = await message.channel.messages.fetch({ limit: 100 });

        // Find the latest user message + bot reply pair
        let previousUserMessage = null;
        let previousBotReply = null;
        for (const msg of messages.values()) {
            if (
                msg.author.id === client.user.id &&  // Bot's message
                msg.reference &&                     // Is a reply
                msg.reference.messageId &&           // Has a referenced message ID
                messages.has(msg.reference.messageId) &&  // Referenced message is in fetched set
                messages.get(msg.reference.messageId).author.id === message.author.id  // References the user
            ) {
                previousBotReply = {
                    content: msg.content,
                    timestamp: msg.createdTimestamp,
                };
                previousUserMessage = {
                    content: messages.get(msg.reference.messageId).content,
                    timestamp: messages.get(msg.reference.messageId).createdTimestamp,
                };
                break;  // Take the most recent pair
            }
        }

        console.log("User's current message:", message.content);
        console.log("Previous user message:", previousUserMessage);
        console.log("Previous bot reply:", previousBotReply);

        // Prepare context for the API
        const context = {
            user_input: message.content,
            previous_user_message: previousUserMessage ? previousUserMessage.content : null,
            previous_bot_reply: previousBotReply ? previousBotReply.content : null,
        };

        console.log('Attempting to fetch from API with context:', context);
        const response = await axios.post(API_ENDPOINT, context);
        console.log('API response data:', response.data.data);

        message.reply(response.data.data.slice(0, 1999));
    } catch (error) {
        console.error('Error:', error);
        // message.reply('Sorry, there was an error processing your request.');
    }
});

client.login(TOKEN);