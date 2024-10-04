// src/routes/rateList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { RateItem } from '../models/rateItem';

const router = express.Router();

// Get all rate items
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM rate_list');
    console.log('rows',rows)
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new rate item
router.post('/', async (req: Request, res: Response) => {
  const newRate: RateItem = req.body;
  try {
    const [result] = await db.query('INSERT INTO rate_list SET ?', newRate);
    const insertedId = (result as any).insertId;
    res.status(201).json({ ...newRate, id: insertedId });
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a rate item
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedRate: RateItem = req.body;
  try {
    await db.query('UPDATE rate_list SET ? WHERE id = ?', [updatedRate, id]);
    res.status(200).json(updatedRate);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a rate item
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM rate_list WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get rate items by search number
router.get('/search/:search_number', async (req: Request, res: Response) => {
  const { search_number } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM rate_list WHERE search_number = ?', [search_number]);
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get rate items by miles range
router.get('/miles-range', async (req: Request, res: Response) => {
  const { min_miles, max_miles } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT * FROM rate_list WHERE min_miles <= ? AND max_miles >= ?',
      [max_miles, min_miles]
    );
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;