const express = require('express');
const app = express();
const { Pool } = require('pg');
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
require('dotenv').config();
const morgan = require('morgan');
// const { createLogger, transports, format } = require('winston');

const PORT = process.env.PORT || 3000;
app.use(morgan('combined'));
// let todos = [
//     { id: 1, text: 'todo 1' },
//     { id: 2, text: 'todo 2' },
// ];

// let nextId = 3;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// pool.query(
//   `CREATE TABLE IF NOT EXISTS todo (
//     id SERIAL PRIMARY KEY,
//     todo TEXT NOT NULL
//   )`
// );

async function initializeDatabase() {
  const client = await pool.connect();
  try {

    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        todo TEXT
      );
    `);

    // Insert initial todos if the table is empty
    const result = await client.query('SELECT COUNT(*) FROM todos');
    if (result.rows[0].count === '0') {
      await client.query(`
        INSERT INTO todos (todo) VALUES
        ('todo1'),
        ('todo2');
      `);
    }
  } finally {
    client.release();
  }

}

app.get('/todos', async (req, res) => {
  // res.json(todos);
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM todos');
    res.json(result.rows);
  } finally {
    client.release();
  }
});

app.post('/todos', async (req, res) => {
  console.log(req.body.todo)
  const newTodo = req.body.todo;
  if (newTodo && newTodo.length <= 140) {
    console.log('New todo:', newTodo);
    // const todoItem = { id: nextId++, text: newTodo };
    // todos.push(todoItem);
    const client = await pool.connect();
    try {
      await client.query('INSERT INTO todos (todo) VALUES ($1)', [newTodo]);
      res.send('Todo created');
    } finally {
      client.release();
    }
    // res.status(201).json({ message: 'Todo created', todo: todoItem });
  } else {
    console.error(errorMessage);
    res.status(400).json({ error: 'Todo text is required and must be less than 140 characters.' });
  }
});

app.get('/', (req, res) => {
  res.send('info on: /todos');
});

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Todo backend service running on port ${PORT}`);
});
