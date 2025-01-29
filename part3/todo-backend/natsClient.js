const { connect } = require('nats');

let natsConnection = null;

async function connectToNats() {
    try {
        natsConnection = await connect({
            servers: process.env.NATS_URL || 'nats://localhost:4222',
        });
        console.log('Connected to NATS');
        return natsConnection;
    } catch (error) {
        console.error('Error connecting to NATS:', error);
        throw error;
    }
}

function getNatsConnection() {
    return natsConnection;
}

module.exports = { connectToNats, getNatsConnection };