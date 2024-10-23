// truck-types.ts
import express from 'express';
import db from '../db';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all truck types
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM truck_types ORDER BY type_code');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching truck types:', error);
    res.status(500).json({ error: 'Error fetching truck types' });
  }
});

// Get a specific truck type
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM truck_types WHERE id = ?', [req.params.id]);
    if ((rows as RowDataPacket[]).length === 0) {
      res.status(404).json({ error: 'Truck type not found' });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.json((rows as any)[0]);
  } catch (error) {
    console.error('Error fetching truck type:', error);
    res.status(500).json({ error: 'Error fetching truck type' });
  }
});

export default router;