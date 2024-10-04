// src/routes/carrierList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { SearchItem } from '../models/searchItem';

const router = express.Router();


// Get all search items
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM search_list');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new search item
router.post('/', async (req: Request, res: Response) => {
  const newSearch: SearchItem = req.body;
  try {
    const [result] = await db.query('INSERT INTO search_list SET ?', newSearch);
    const insertedId = (result as any).insertId;
    res.status(201).json({ ...newSearch, id: insertedId });
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a search item
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedSearch: SearchItem = req.body;
  try {
    await db.query('UPDATE search_list SET ? WHERE id = ?', [updatedSearch, id]);
    res.status(200).json(updatedSearch);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a search item
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM search_list WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get search items by date range
router.get('/date-range', async (req: Request, res: Response) => {
  const { start_date, end_date } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT * FROM search_list WHERE pu_date_start >= ? AND pu_date_end <= ?',
      [start_date, end_date]
    );
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;