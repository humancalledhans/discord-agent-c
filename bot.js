const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

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


client.once('ready', () => {
    console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
    console.log("message received: ", message.content);
    if (message.author.bot) return;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: message.content }),
        });

        if (!response.ok) throw new Error('API response was not ok');
        const data = await response.json();
        message.reply(data.answer);
    } catch (error) {
        console.error('Error:', error);
        message.reply('Sorry, there was an error processing your request.');
    }
});

client.login(TOKEN);