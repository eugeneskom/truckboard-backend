// src/routes/truckList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Truck } from '../models/truck';

const router = express.Router();

// Get all trucks
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM trucks');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get trucks by carrier id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const carrierId = req.params.id;
    const [rows] = await db.query('SELECT * FROM trucks WHERE carrier_id = ?', [carrierId]);
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
    const [result] = await db.query('INSERT INTO trucks SET ?', newTruck);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertedId = (result as any).insertId;
    res.status(201).json({ ...newTruck, id: insertedId });
  } catch (error) {
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a truck
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedTruck: Truck = req.body;
  console.log('updatedTruck', updatedTruck);
  try {
    // Convert accessories array to JSON string
    updatedTruck.accessories = JSON.stringify(updatedTruck.accessories);
    await db.query('UPDATE trucks SET ? WHERE id = ?', [updatedTruck, id]);
    res.status(200).json(updatedTruck);
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: error });
  }
});

// Delete a truck

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const connection = await db.getConnection();
  try {
    
    await connection.beginTransaction();

    // Delete related rates
    await connection.query('DELETE FROM rates WHERE search_id IN (SELECT id FROM searches WHERE truck_id = ?)', [id]);

    // Delete related searches
    await connection.query('DELETE FROM searches WHERE truck_id = ?', [id]);

    // Update driver to remove association with the truck
    await connection.query('UPDATE drivers SET truck_id = NULL WHERE truck_id = ?', [id]);

    // Finally, delete the truck
    await connection.query('DELETE FROM trucks WHERE id = ?', [id]);

    await connection.commit();
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Database delete error:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Add an accessory to a truck
router.post('/:id/accessories', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { accessory } = req.body;

  try {
    await db.query(
      'UPDATE trucks SET accessories = JSON_ARRAY_APPEND(accessories, "$", ?) WHERE id = ?',
      [accessory, id]
    );
    res.status(200).json({ message: 'Accessory added successfully' });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove an accessory from a truck
router.delete('/:id/accessories/:accessory', async (req: Request, res: Response) => {
  const { id, accessory } = req.params;

  try {
    await db.query(
      'UPDATE trucks SET accessories = JSON_REMOVE(accessories, JSON_UNQUOTE(JSON_SEARCH(accessories, "one", ?))) WHERE id = ?',
      [accessory, id]
    );
    res.status(200).json({ message: 'Accessory removed successfully' });
  } catch (error) {
    console.error('Database update error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;