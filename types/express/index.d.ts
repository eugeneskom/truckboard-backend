import { Server as WebSocketServer } from 'ws';

declare global {
  namespace Express {
    interface Application {
      wss: WebSocketServer;
    }
  }
}