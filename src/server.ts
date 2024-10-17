// src/server.ts

import http from 'http';
import WebSocket from 'ws';
import app from './app';

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3001;

// Create a separate WebSocket server
const wss = new WebSocket.Server({ port: Number(WS_PORT) });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
  console.log(`WebSocket Server is running on port ${WS_PORT}`);
});

export { wss };