const express = require('express');
const app = express();
const { Pool } = require('pg');
require('dotenv').config();

let counter = 0;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

pool.on('connect', () => console.log('Connected to the database.'));
pool.on('error', (err) => console.error('Database connection error:', err));

async function updateCounter() {
  const client = await pool.connect();
  try {
    console.log('Updating counter:', counter);
    await client.query('UPDATE counter SET count = $1 WHERE id = 1', [counter]);
    console.log('Counter updated successfully.');
  } catch (err) {
    console.error('Error updating counter:', err);
  } finally {
    client.release();
  }
}

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database...');
    await client.query('CREATE TABLE IF NOT EXISTS counter (id SERIAL PRIMARY KEY, count INT)');
    const res = await client.query('SELECT count FROM counter WHERE id = 1');
    if (res.rows.length > 0) {
      counter = res.rows[0].count;
      console.log('Counter loaded from database:', counter);
    } else {
      await client.query('INSERT INTO counter (count) VALUES (0)');
      console.log('Counter initialized to 0.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.status(200).json({ status: 'healthy' });
  } catch (err) {
    console.error('Error connecting to the database:', err);
    res.status(500).json({ status: 'unhealthy' });
  }
});

app.get('/pingpong', async (req, res) => {
  counter++;
  try {
    await updateCounter();
    res.send(`pong ${counter}`);
  } catch (err) {
    console.error('Error handling /pingpong request:', err);
    res.status(500).send('Internal server error.');
  }
});

app.get('/', (req, res) => {
  res.send('Ping-Pong service is working!');
});

app.get('/count', (req, res) => {
  res.json({ count: counter });
});

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  try {
    await initializeDatabase();
    console.log(`Server started on port ${port}`);
  } catch (err) {
    console.error('Error starting server:', err);
  }
});