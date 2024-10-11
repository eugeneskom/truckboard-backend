import http from 'http';
import WebSocket from 'ws';
import app from './app';  
import { setupWebSocketServer } from './websocket';
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

setupWebSocketServer(wss);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { wss };  