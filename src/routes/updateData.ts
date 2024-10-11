import express from 'express';
import db from '../db';
// import { wss } from '../server';
import { wss } from '../server';
import WebSocket from 'ws';
// import { broadcastUpdate } from '../websocket';

const router = express.Router();

interface UpdateParams {
  table: string;
  id: number;
  field: string | Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function broadcastUpdate(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'update',
          data,
        }),
      );
    }
  });
}

async function updateTable({ table, id, field, value }: UpdateParams): Promise<void> {
  let query: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let params: any[];

  switch (table) {
    case 'searches':
      query = 'UPDATE searches SET ?? = ? WHERE id = ?';
      params = [field, value, id];
      break;
    case 'rates':
      query = 'UPDATE rates SET ?? = ? WHERE search_id = ?';
      params = [field, value, id];
      break;
    case 'trucks':
      query = `
        UPDATE trucks t
        JOIN searches s ON s.truck_id = t.id
        SET t.?? = ?
        WHERE s.id = ?
      `;
      // Map 'truck_type' to 'type' if it's the field being updated
      const truckField = field === 'truck_type' ? 'type' : field;
      params = [truckField, value, id];
      break;
    case 'drivers':
      // Map drivers data to normalized field names
      const driverField = field === 'driver_lastname' ? 'lastname' : 
      field === 'driver_name' ? 'name' : field === "driver_email" ? "email" : field === "driver_phone" ? "phone" : field;

      query = `
    UPDATE drivers d
    JOIN searches s ON s.driver_id = d.id
    SET d.?? = ?
    WHERE s.id = ?
  `;
      params = [driverField, value, id];
      break;
    case 'carriers':
      query = `
        UPDATE carriers c
        JOIN searches s ON s.carrier_id = c.id
        SET c.?? = ?
        WHERE s.id = ?
      `;
      params = [field, value, id];
      break;
    case 'users':
      query = `
        UPDATE users u
        JOIN carriers c ON c.agent_id = u.id
        JOIN searches s ON s.carrier_id = c.id
        SET u.?? = ?
        WHERE s.id = ?
      `;
      params = [field, value, id];
      break;
    default:
      throw new Error('Invalid table name');
  }

  await db.query(query, params);
}

router.put('/', async (req: express.Request, res: express.Response) => {
  const { table, id, field, value } = req.body;
  console.log('updateData', table, id, field, value);

  try {
    await updateTable({ table, id, field, value });
    // Broadcast the update to all connected clients
    broadcastUpdate({ table, id, field, value });

    res.json({ message: 'Update successful' });
  } catch (error) {
    console.error('Error updating data:', error);
    if (error instanceof Error && error.message === 'Invalid table name') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
