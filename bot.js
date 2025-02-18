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
const API_ENDPOINT = BASE_URL + "/fetch_embedding_output";

const allowedChannels = [
    '1341191250266554500',
];




client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
    console.log("messageCreate event triggered");
    console.log("message received: ", message.content);

    // Check if the message is in an allowed channel
    if (!allowedChannels.includes(message.channel.id)) {
        console.log("Ignoring message from channel:", message.channel.id);
        return;
    }

    if (message.author.bot) {
        console.log("Message from bot, ignoring.");
        return;
    }

    try {
        console.log('Attempting to fetch from API');
        const response = await axios.post(API_ENDPOINT, { query: message.content });
        console.log('API response data:', response.data);
        message.reply(response.data.answer);
    } catch (error) {
        console.error('Error:', error);
        message.reply('Sorry, there was an error processing your request.');
    }
});

client.login(TOKEN);