const express = require('express');
const fs = require('fs');
const app = express();

let counter = 0;

// app.get('/pingpong', (req, res) => {
//   counter++;
//   res.send(`pong ${counter}`);
// });

function readCounter() {
  if (fs.existsSync('/data/counter.txt')) {
    counter = parseInt(fs.readFileSync('/data/counter.txt', 'utf8'));
  }
}

function writeCounter() {
  fs.writeFileSync('/data/counter.txt', counter.toString());
}

app.get('/pingpong', (req, res) => {
  readCounter();
  counter++;
  writeCounter();
  res.send(`pong ${counter}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});