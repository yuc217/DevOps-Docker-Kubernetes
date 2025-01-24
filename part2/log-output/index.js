const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const app = express();
const { Pool } = require('pg');
const randomString = uuidv4();
const fs = require('fs');
let counter = 0;

app.get('/status', async (req, res) => {
  const timestamp = new Date().toISOString();
  try {
    const response = await axios.get('http://ping-pong-service:2345/count');
    const fileContent = fs.readFileSync('/config/information.txt', 'utf8');
    const message = process.env.MESSAGE;
    const counter = response.data.count;
    const data = `${timestamp}: ${randomString}\n${fileContent}\nMESSAGE: ${message}\nPing / Pongs: ${counter}`;
    console.log(data);
    
    // const data = `${timestamp}: ${randomString}\nPing / Pongs: ${counter}`;
    res.send(data);
  } catch (error) {
    console.error('Error fetching pong count:', error);
    res.status(500).send('Error fetching pong count');
  }
});

app.get('/', (req, res) => {
    res.send('info on: /status');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});