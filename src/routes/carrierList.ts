// src/routes/carrierList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Carrier } from '../models/carrier';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all carriers
router.get('/', async (req: Request, res: Response) => {
  try {
    // const [rows] = await db.query('SELECT * FROM carriers');

    const [carriers] = await db.query(`
      SELECT c.*, 
             COUNT(DISTINCT t.id) AS truck_count, 
             COUNT(DISTINCT d.id) AS driver_count
      FROM carriers c
      LEFT JOIN trucks t ON c.id = t.carrier_id
      LEFT JOIN drivers d ON c.id = d.carrier_id
      GROUP BY c.id
    `);
    res.json(carriers);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get carriers drivers and trucks by carrier id
router.get('/:id/details', async (req: Request, res: Response) => {
  try {
    const carrierId = req.params.id;
    const [trucks] = await db.query('SELECT * FROM trucks WHERE carrier_id = ?', [carrierId]);
    const [drivers] = await db.query('SELECT * FROM drivers WHERE carrier_id = ?', [carrierId]);
    res.json({ trucks, drivers });
  } catch (error) {
    console.error('Error fetching carrier details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new carrier
router.post('/', async (req: any, res: any) => {
  const { agent_id, ...carrierData } = req.body;

  try {
    // Check if the agent exists
    const [agents] = await db.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [agent_id]);

    if (agents.length === 0) {
      return res.status(400).json({ error: 'Invalid agent_id. The specified agent does not exist.' });
    }

    // If the agent exists, proceed with carrier creation
    const [result] = await db.query('INSERT INTO carriers SET ?', { ...carrierData, agent_id });
    interface insertResult {
      insertId: number;
    }
    res.status(201).json({ id: (result as insertResult).insertId, ...carrierData, agent_id });
  } catch (error: any) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Update a carrier
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedCarrier: Carrier = req.body;  // This should be the parsed data from the frontend
  console.log('updatedCarrier',updatedCarrier)
  try {
    // Ensure that updatedCarrier is directly mapped to the query
    await db.query('UPDATE carriers SET ? WHERE id = ?', [updatedCarrier, id]);
    res.status(200).json(updatedCarrier);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: error });
  }
});


// Delete a carrier
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM carriers WHERE id = ?', [id]);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
