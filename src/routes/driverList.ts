// src/routes/driverList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Driver } from '../models/driver';

const router = express.Router();

// Get all drivers
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM driver_list');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new driver
router.post('/', async (req: Request, res: Response) => {
  const newDriver: Driver = req.body;
  try {
    const [result] = await db.query('INSERT INTO driver_list SET ?', newDriver);
    const insertedId = (result as any).insertId;
    res.status(201).json({ ...newDriver, id: insertedId });
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a driver
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedDriver: Driver = req.body;
  console.log('updatedDriver', updatedDriver);
  try {
    await db.query('UPDATE driver_list SET ? WHERE id = ?', [updatedDriver, id]);
    res.status(200).json(updatedDriver);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: error });
  }
});

// Delete a driver
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM driver_list WHERE id = ?', [id]);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get drivers by carrier number
router.get('/carrier/:carrier_number', async (req: Request, res: Response) => {
  const { carrier_number } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM driver_list WHERE carrier_number = ?', [carrier_number]);
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;