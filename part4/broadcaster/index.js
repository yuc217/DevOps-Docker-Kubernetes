const { connect } = require('nats');
require('dotenv').config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendToDiscord(message) {
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
            }),
        });
        if (!response.ok) {
            throw new Error(`Discord API responded with status ${response.status}`);
        }
    } catch (error) {
        console.error('Error sending message to Discord:', error);
        throw error;
    }
}

async function startBroadcaster() {
    try {
        const nc = await connect({servers: process.env.NATS_URL || 'nats://localhost:4222',});
        console.log('Connected to NATS');
        const subscription = nc.subscribe('todos.created', {
            queue: 'broadcaster-group' 
        });
        const updateSubscription = nc.subscribe('todos.updated', {
            queue: 'broadcaster-group'
        });
        for await (const msg of subscription) {
            try {
                const data = JSON.parse(msg.data.toString());
                const message = `New todo created: ${data.todo.text}`;
                await sendToDiscord(message);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        }

        for await (const msg of updateSubscription) {
            try {
                const data = JSON.parse(msg.data.toString());
                const message = `Todo updated: ${data.todo.text} (Marked as done)`;
                await sendToDiscord(message);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        }
    } catch (error) {
        console.error('Error in broadcaster:', error);
        process.exit(1);
    }
}

startBroadcaster().catch(console.error);