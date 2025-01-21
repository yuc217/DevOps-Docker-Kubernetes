const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

const IMAGE_PATH = path.join(__dirname, 'data', 'image.jpg');
const IMAGE_URL = 'https://picsum.photos/1200';
const CACHE_DURATION = 60 * 60 * 1000;
const IMAGE_DIR = path.join(__dirname, 'data');

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

app.get('/', (req, res) => {
  res.render('index', { todos: ['todo 1', 'todo 2', 'todo 3'] });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});

app.set('view engine', 'ejs');