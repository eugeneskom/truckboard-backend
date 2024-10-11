// In your websocket.ts file on the backend

import WebSocket from 'ws';

export function setupWebSocketServer(wss: WebSocket.Server) {
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      console.log('Received:', message.toString());
      
      // Echo the message back to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'echo',
            message: message.toString()
          }));
        }
      });
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
}