const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');
const app = express();

// const randomString = uuidv4();
// let timestamp = new Date().toISOString();

// function logRandomString() {
//   timestamp = new Date().toISOString();
//   const data = `${timestamp}: ${randomString}`;
//   console.log(data);
// }

// setInterval(logRandomString, 5000);

function getLogWithHash() {
  const data = fs.readFileSync('/data/log.txt', 'utf8');
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return { data, hash };
}

app.get('/status', (req, res) => {
  const logWithHash = getLogWithHash();
  res.json(logWithHash);
});

app.get('/', (req, res) => {
  res.send('Hello, World!   Timestamp on /status');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});