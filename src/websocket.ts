import WebSocket from 'ws';
import { wss } from './server';

export interface WebSocketMessage {
  type: 'update' | 'add' | 'delete';
  table: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export function broadcastMessage(message: WebSocketMessage): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendUpdateMessage(table: string, id: number, field: string, value: any): void {
  broadcastMessage({
    type: 'update',
    table,
    data: { id, field, value },
  });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendAddMessage(table: string, data: any): void {
  broadcastMessage({
    type: 'add',
    table,
    data,
  });
}

export function sendDeleteMessage(table: string, id: number): void {
  broadcastMessage({
    type: 'delete',
    table,
    data: { id },
  });
}