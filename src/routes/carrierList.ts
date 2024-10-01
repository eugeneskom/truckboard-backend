// src/routes/carrierList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Carrier } from '../models/carrier';

const router = express.Router();

// Get all carriers
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM carrier_list');
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
    await db.query('INSERT INTO carrier_list SET ?', newCarrier);
    res.status(201).json(newCarrier);
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a carrier
router.put('/:carrier_number', async (req: Request, res: Response) => {
  const { carrier_number } = req.params;
  const updatedCarrier: Carrier = req.body;

  try {
    await db.query('UPDATE carrier_list SET ? WHERE carrier_number = ?', [updatedCarrier, carrier_number]);
    res.status(200).json(updatedCarrier);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a carrier
router.delete('/:carrier_number', async (req: Request, res: Response) => {
  const { carrier_number } = req.params;

  try {
    await db.query('DELETE FROM carrier_list WHERE carrier_number = ?', [carrier_number]);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
