const express = require('express');
const app = express();
const { Pool } = require('pg');
const bodyParser = require('body-parser');
app.use(express.json());
app.use(bodyParser.json());
require('dotenv').config();
const morgan = require('morgan');
// const { createLogger, transports, format } = require('winston');
const { connectToNats, getNatsConnection } = require('./natsClient');

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

pool.on('connect', () => console.log('Connected to the database.'));
pool.on('error', (err) => console.error('Database connection error:', err));

async function initializeDatabase() {
  const client = await pool.connect();
  try {

    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT,
        done BOOLEAN DEFAULT FALSE
      );
    `);

    // Insert initial todos if the table is empty
    const result = await client.query('SELECT COUNT(*) FROM todos');
    if (result.rows[0].count === '0') {
      await client.query(`
        INSERT INTO todos (text) VALUES
        ('todo1'),
        ('todo2');
      `);
    }
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


// for part4
app.put('/todos/:id', async (req, res) => {
  const todoId = req.params.id;
  const client = await pool.connect();
  try {
    const result = await client.query('UPDATE todos SET done = TRUE WHERE id = $1 RETURNING *', [todoId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      const nats = getNatsConnection();
            await nats.publish('todos.updated', JSON.stringify({
                event: 'todo_updated',
                todo: result.rows[0]
            }));
      res.json(result.rows[0]);
    }
  } finally {
    client.release();
  }
});

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
  // console.log(req.body.todo)
  const newTodo = req.body.todo;
  if (newTodo && newTodo.length <= 140) {
    console.log('New todo:', newTodo);
    // const todoItem = { id: nextId++, text: newTodo };
    // todos.push(todoItem);
    const client = await pool.connect();
    try {
      await client.query('INSERT INTO todos (text) VALUES ($1)', [newTodo]);
      const nats = getNatsConnection();
            await nats.publish('todos.created', JSON.stringify({
                event: 'todo_created',
                todo: result.rows[0]
            }));
      res.status(201).json({ message: 'Todo created' });
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
  await connectToNats();
  console.log(`Todo backend service running on port ${PORT}`);
});
