const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

const IMAGE_PATH = path.join(__dirname, 'data', 'image.jpg');
const IMAGE_URL = 'https://picsum.photos/1200';
const CACHE_DURATION = 60 * 60 * 1000;
const IMAGE_DIR = path.join(__dirname, 'data');
app.use(express.json());
let imageTimestamp = 0;

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

async function fetchAndCacheImage() {
  const response = await axios({
    url: IMAGE_URL,
    method: 'GET',
    responseType: 'stream'
  });
  const writer = fs.createWriteStream(IMAGE_PATH);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

app.use('/image.jpg', (req, res, next) => {
  const now = Date.now();
  if (now - imageTimestamp > CACHE_DURATION) {
    fetchAndCacheImage().then(() => {
      imageTimestamp = now;
      res.sendFile(IMAGE_PATH);
    }).catch(next);
  } else {
    res.sendFile(IMAGE_PATH);
  }
});

app.post('/todos', async (req, res) => {
  console.log(req.body.todo)
  const newTodo = req.body.todo;
  try {
    const response = await axios.post('http://todo-backend-service:2345/todos', { todo: newTodo });
    // const response = await axios.post('http://localhost:3000/todos', { todo: newTodo });
    res.json(response.data);
    console.log('Todo created:', response.data);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).send('Error creating todo');
  }
});

app.get('/health', async (req, res) => {
  try {
    const response = await axios.get('http://todo-backend-service:2345/todos');
    if (response.status === 200) {
      res.status(200).json({ status: 'healthy' });
    } else {
      res.status(500).json({ status: 'unhealthy' });
    }
  } catch (err) {
    console.error('Error connecting to the backend service:', err);
    res.status(500).json({ status: 'unhealthy' });
  }
});

// app.get('/', (req, res) => {
//   res.render('index', { todos: ['todo 1', 'todo 2', 'todo 3'] });
// });

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://todo-backend-service:2345/todos');
    // const response = await axios.get('http://localhost:3000/todos');
    const todos = response.data;
    // console.log('Todos:', todos);
    res.render('index', { todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).send('Error fetching todos');
  }
});

app.put('/todos/:id', async (req, res) => {
  const todoId = req.params.id;
  try {
    const response = await axios.put(`http://todo-backend-service:2345/todos/${todoId}`, { done: true });
    // const response = await axios.put(`http://localhost:3000/todos/${todoId}`, { done: true });
    
    res.json(response.data);
    console.log('Todo marked as done:', response.data);
  } catch (error) {
    console.error('Error marking todo as done:', error);
    res.status(500).send('Error marking todo as done');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});

app.set('view engine', 'ejs');