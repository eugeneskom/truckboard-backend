// src/routes/carrierList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Carrier } from '../models/carrier';

const router = express.Router();

// Get all carriers
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM agent_list');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new carrier
router.post('/', async (req: Request, res: Response) => {
  const newCarrier: Carrier = req.body; // Assuming the request body contains a Carrier object
  try {
    await db.query('INSERT INTO agent_list SET ?', newCarrier);
    res.status(201).json(newCarrier);
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a carrier
router.put('/:agent_number', async (req: Request, res: Response) => {
  const { agent_number } = req.params;
  const updateAgent: Carrier = req.body;  // This should be the parsed data from the frontend
  console.log('updateAgent',updateAgent)
  try {
    // Ensure that updateAgent is directly mapped to the query
    await db.query('UPDATE agent_list SET ? WHERE agent_number = ?', [updateAgent, agent_number]);
    res.status(200).json(updateAgent);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: error });
  }
});


// Delete a carrier
router.delete('/:agent_number', async (req: Request, res: Response) => {
  const { agent_number } = req.params;

  try {
    await db.query('DELETE FROM agent_list WHERE agent_number = ?', [agent_number]);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
