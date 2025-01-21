const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const randomString = uuidv4();

function logRandomString() {
  const timestamp = new Date().toISOString();
  const counter = fs.existsSync('/data/counter.txt') ? fs.readFileSync('/data/counter.txt', 'utf8') : '0';
  const data = `${timestamp}: ${randomString}\nPing / Pongs: ${counter}`;
  fs.writeFileSync('/data/log.txt', data);
  console.log(data);
}

setInterval(logRandomString, 5000);