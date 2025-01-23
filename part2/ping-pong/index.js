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

// pool.query(
//   `CREATE TABLE IF NOT EXISTS counter (
//     id SERIAL PRIMARY KEY,
//     counter INT NOT NULL
//   )`
// );

async function updateCounter() {
  const client = await pool.connect();
  try {
    await client.query('UPDATE counter SET count = $1', [counter]);
  } finally {
    client.release();
  }
}

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS counter (id SERIAL PRIMARY KEY, count INT)');
    const res = await client.query('SELECT count FROM counter');
    if (res.rows.length > 0) {
      counter = res.rows[0].count;
    } else {
      await client.query('INSERT INTO counter (count) VALUES (0)');
    }
  } finally {
    client.release();
  }
}

app.get('/pingpong', async (req, res) => {
  counter++;
  await updateCounter();
  res.send(`pong ${counter}`);
});

app.get('/count', (req, res) => {
  res.json({ count: counter });
});

const port = process.env.PORT || 3000;
app.listen(port, async() => {
  await initializeDatabase();
  console.log(`Server started in port ${port}`);
});