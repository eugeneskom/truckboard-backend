import http from 'http';
import WebSocket from 'ws';
import app from './app';

const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

const wss = new WebSocket.Server({ server });

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
  console.log(`HTTP and WebSocket Server is running on port ${PORT}`);
});

export { wss };