// src/routes/carrierList.ts
import express, { Request, Response } from 'express';
import db from '../db';
import { Driver } from '../models/driver';
import { Truck } from '../models/truck';
import { ResultSetHeader } from 'mysql2';

const router = express.Router();

// Get all carriers
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM driver_posting');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





const createPosting = async (req: Request, res: Response) => {
  let conn;
  try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      // 1. Verify driver and truck exist
      const [driverResults] = await conn.query<any[]>('SELECT id FROM driver_list WHERE id = ?', [req.body.driver_id]);
      const [truckResults] = await conn.query<any[]>('SELECT id FROM truck_list WHERE id = ?', [req.body.truck_id]);

      if (driverResults.length === 0 || truckResults.length === 0) {
          throw new Error('Driver or truck does not exist');
      }

      // 2. Insert into searches table
      const [searchResult] = await conn.query<ResultSetHeader>(`
          INSERT INTO search_list 
          (search_number, pu_city, destination, late_pick_up, pu_date_start, pu_date_end, del_date_start, del_date_end)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
          req.body.search_number,
          req.body.pu_city,
          req.body.destination,
          req.body.late_pick_up,
          req.body.pu_date_start,
          req.body.pu_date_end,
          req.body.del_date_start,
          req.body.del_date_end
      ]);
      const searchId = searchResult.insertId;

      // 3. Insert into rates table
      const [rateResult] = await conn.query<ResultSetHeader>(`
          INSERT INTO rate_list
          (dead_head, min_miles, max_miles, rpm, min_rate, round_to, extra_charge)
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
          req.body.dead_head,
          req.body.min_miles,
          req.body.max_miles,
          req.body.rpm,
          req.body.min_rate,
          req.body.round_to,
          req.body.extra_charge
      ]);
      const rateId = rateResult.insertId;

      // 4. Insert into driver_postings table
      await conn.query<ResultSetHeader>(`
          INSERT INTO driver_postings
          (driver_id, truck_id, search_id, rate_id)
          VALUES (?, ?, ?, ?)
      `, [req.body.driver_id, req.body.truck_id, searchId, rateId]);

      await conn.commit();
      res.status(201).json({ 
          message: 'Posting created successfully', 
          searchId, 
          rateId,
          driverId: req.body.driver_id,
          truckId: req.body.truck_id
      });
  } catch (err) {
      if (conn) await conn.rollback();
      console.error(err);
      if (err instanceof Error && err.message === 'Driver or truck does not exist') {
          res.status(400).json({ error: err.message });
      } else {
          res.status(500).json({ error: 'An error occurred while creating the posting.' });
      }
  } finally {
      if (conn) conn.release();
  }
};



// Create a new driver posting
router.post('/', createPosting);


export default router;
