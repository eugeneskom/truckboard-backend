// src/routes/driverList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Driver } from '../models/driver';

const router = express.Router();

// Get all drivers or drivers by carrier ID
router.get('/', async (req: Request, res: Response) => {
  const carrierId = req.query.carrierId;

  try {
    let query = 'SELECT * FROM drivers';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let params: any[] = [];

    if (carrierId) {
      query += ' WHERE carrier_id = ?';
      params.push(carrierId);
    }

    const [rows] = await db.query(query, params);
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
    const [result] = await db.query('INSERT INTO drivers SET ?', newDriver);
    interface InsertResult {
      insertId: number;
    }
    const insertedId = (result as InsertResult).insertId;
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
    await db.query('UPDATE drivers SET ? WHERE id = ?', [updatedDriver, id]);
    res.status(200).json(updatedDriver);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: error });
  }
});


// Assign a driver to a truck by driver id
router.put('/assign/:id', async (req: Request, res: Response) => {
  try {
    const driverId = req.params.id;
    const { truck_id } = req.body;
    await db.query('UPDATE drivers SET truck_id = ? WHERE id = ?', [truck_id, driverId]);
    res.json({ message: 'Driver assigned successfully' });
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a driver by ID
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM drivers WHERE id = ?', [id]);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get drivers by carrier number
router.get('/carrier/:carrierId', async (req: Request, res: Response) => {
  const { carrierId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM drivers WHERE carrier_id = ?', [carrierId]);
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get unassigned drivers by Carrier ID.
router.get('/unassigned/:carrierId', async (req: Request, res: Response) => {
  const { carrierId } = req.params;
  
  try {
    const [rows] = await db.query(`
      SELECT t.*
      FROM trucks t
      LEFT JOIN drivers d ON t.id = d.truck_id
      WHERE t.carrier_id = ? AND d.id IS NULL
    `, [carrierId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching unassigned trucks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;