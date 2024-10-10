// src/routes/carrierList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { SearchItem } from '../models/searchItem';
import { OkPacket, RowDataPacket } from 'mysql2';

const router = express.Router();


// Get all search items
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM searches');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

 

// Create a new search item
router.post('/', async (req: Request, res: Response) => {
  const newSearch: SearchItem = req.body;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get the truck_id for the selected driver
    const [truckRows] = await connection.query<RowDataPacket[]>(
      'SELECT truck_id FROM drivers WHERE id = ?',
      [newSearch.driver_id]
    );

    if (truckRows.length === 0) {
      throw new Error('Driver not found or not associated with a truck');
    }
    const truck_id = truckRows[0].truck_id;

    // Insert the new search with the retrieved truck_id
    const [result] = await connection.query<OkPacket>(
      'INSERT INTO searches SET ?',
      {...newSearch, truck_id}
    );
    const insertedId = result.insertId;

    // Create a default rate for the new search
    const defaultRate = {
      search_id: insertedId,
      dead_head: 0,
      min_miles: 0,
      max_miles: 0,
      rpm: 0,
      min_rate: 0,
      round_to: 0,
      extra: 0
    };
    await connection.query('INSERT INTO rates SET ?', defaultRate);

    await connection.commit();

    // Fetch the complete search data to return
    const [searchData] = await connection.query<RowDataPacket[]>(`
      SELECT s.*, r.*, c.company_name, c.home_city, c.carrier_email, c.mc_number, c.company_phone,
             d.name as driver_name, d.lastname as driver_lastname, d.phone as driver_phone, d.email as driver_email,
             t.type as truck_type, t.dims as truck_dims, t.payload, t.accessories
      FROM searches s
      LEFT JOIN rates r ON s.id = r.search_id
      LEFT JOIN carriers c ON s.carrier_id = c.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN trucks t ON s.truck_id = t.id
      WHERE s.id = ?
    `, [insertedId]);

    res.status(201).json(searchData[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Database insert error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});
// Delete a search item and its associated rate
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Delete the associated rates first
    await connection.query('DELETE FROM rates WHERE search_id = ?', [id]);

    // Then delete the search
    await connection.query('DELETE FROM searches WHERE id = ?', [id]);

    await connection.commit();
    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error('Database delete error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
});

// Delete a search item
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM searches WHERE id = ?', [id]);
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
      'SELECT * FROM searches WHERE pu_date_start >= ? AND pu_date_end <= ?',
      [start_date, end_date]
    );
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;