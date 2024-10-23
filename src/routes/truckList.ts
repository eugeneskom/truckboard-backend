// src/routes/truckList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Truck } from '../models/truck';
import { OkPacket, RowDataPacket } from 'mysql2';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.post('/', async (req: any, res: any) => {
  try {
    // Log the raw request body
    console.log('Raw request body:', req.body);

    // First verify that the type_id exists in truck_types
    const [typeExists] = await db.query<RowDataPacket[]>(
      'SELECT id FROM truck_types WHERE id = ?',
      [req.body.type_id]
    );

    if (!typeExists.length) {
      return res.status(400).json({ 
        error: 'Invalid type_id. Type does not exist.' 
      });
    }

    // Extract and convert values explicitly
    const truckData = {
      carrier_id: req.body.carrier_id ? BigInt(req.body.carrier_id) : null,
      type_id: req.body.type_id ? Number(req.body.type_id) : null,
      dims: req.body.dims || null,
      payload: req.body.payload ? Number(req.body.payload) : null,
      accessories: req.body.accessories || "",
      active: req.body.active ? 1 : 0
    };

    // Log the processed data
    console.log('Processed truck data:', truckData);

    // Use explicit SQL query with named values
    const query = `
      INSERT INTO trucks 
      (carrier_id, type_id, dims, payload, accessories, active)
      VALUES 
      (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      truckData.carrier_id,
      truckData.type_id,
      truckData.dims,
      truckData.payload,
      truckData.accessories,
      truckData.active
    ];

    // Log the query and values
    console.log('Query:', query);
    console.log('Values:', values);

    const [result] = await db.query<OkPacket>(query, values);

    // Fetch the inserted truck with type information
    const [insertedTruck] = await db.query<RowDataPacket[]>(`
      SELECT t.*, tt.type_code as type
      FROM trucks t
      LEFT JOIN truck_types tt ON t.type_id = tt.id
      WHERE t.id = ?
    `, [result.insertId]);

    // Log the inserted data
    console.log('Inserted truck data:', insertedTruck[0]);

    res.status(201).json(insertedTruck[0]);
  } catch (error) {
    console.error('Database insert error:', error);
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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