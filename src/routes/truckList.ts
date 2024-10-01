// src/routes/truckList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Truck } from '../models/truck';

const router = express.Router();

// Get all trucks
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM truck_list');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new truck
router.post('/', async (req: Request, res: Response) => {
  const newTruck: Truck = req.body;
  try {
    // Convert accessories array to JSON string
    newTruck.accessories = JSON.stringify(newTruck.accessories);
    await db.query('INSERT INTO truck_list SET ?', newTruck);
    res.status(201).json(newTruck);
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a truck
router.put('/:truck_number', async (req: Request, res: Response) => {
  const { truck_number } = req.params;
  const updatedTruck: Truck = req.body;
  console.log('updatedTruck', updatedTruck);
  try {
    // Convert accessories array to JSON string
    updatedTruck.accessories = JSON.stringify(updatedTruck.accessories);
    await db.query('UPDATE truck_list SET ? WHERE truck_number = ?', [updatedTruck, truck_number]);
    res.status(200).json(updatedTruck);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: error });
  }
});

// Delete a truck
router.delete('/:truck_number', async (req: Request, res: Response) => {
  const { truck_number } = req.params;

  try {
    await db.query('DELETE FROM truck_list WHERE truck_number = ?', [truck_number]);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add an accessory to a truck
router.post('/:truck_number/accessories', async (req: Request, res: Response) => {
  const { truck_number } = req.params;
  const { accessory } = req.body;

  try {
    await db.query(
      'UPDATE truck_list SET accessories = JSON_ARRAY_APPEND(accessories, "$", ?) WHERE truck_number = ?',
      [accessory, truck_number]
    );
    res.status(200).json({ message: 'Accessory added successfully' });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove an accessory from a truck
router.delete('/:truck_number/accessories/:accessory', async (req: Request, res: Response) => {
  const { truck_number, accessory } = req.params;

  try {
    await db.query(
      'UPDATE truck_list SET accessories = JSON_REMOVE(accessories, JSON_UNQUOTE(JSON_SEARCH(accessories, "one", ?))) WHERE truck_number = ?',
      [accessory, truck_number]
    );
    res.status(200).json({ message: 'Accessory removed successfully' });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;