// src/routes/usersList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Carrier } from '../models/carrier';

const router = express.Router();

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new carrier
router.post('/', async (req: Request, res: Response) => {
  const newUser: Carrier = req.body; // Assuming the request body contains a Carrier object
  try {
    await db.query('INSERT INTO users SET ?', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a user
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const uodatedUser: Carrier = req.body;  // This should be the parsed data from the frontend
  console.log('uodatedUser',uodatedUser)
  try {
    // Ensure that uodatedUser is directly mapped to the query
    await db.query('UPDATE users SET ? WHERE id = ?', [uodatedUser, id]);
    res.status(200).json(uodatedUser);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: error });
  }
});


// Delete a user
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
