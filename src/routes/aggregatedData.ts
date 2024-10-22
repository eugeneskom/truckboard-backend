import express, { Request, Response } from 'express';
import db from '../db';
import { RowDataPacket } from 'mysql2';

const router = express.Router();
interface CountResult extends RowDataPacket {
  total: number;
}

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await db.query<CountResult[]>(
      'SELECT COUNT(*) as total FROM searches'
    );
    const totalRows = countResult[0].total;

    const [rows] = await db.query(`
      SELECT 
          s.id AS search_id,
          r.dead_head,
          r.min_miles,
          r.max_miles,
          r.rpm,
          r.min_rate,
          r.round_to,
          r.extra,
          t.id AS truck_id,
          s.posting,
          s.dat_posting,
          s.call_driver,
          s.pu_city,
          s.destination,
          s.late_pick_up,
          s.pu_date_start,
          s.pu_date_end,
          s.del_date_start,
          s.del_date_end,
          c.id AS carrier_id,
          t.type AS truck_type,
          t.dims AS truck_dims,
          t.payload,
          t.accessories,
          d.id AS driver_id,
          d.name AS driver_name,
          d.lastname AS driver_lastname,
          d.phone AS driver_phone,
          d.email AS driver_email,
          d.perks,
          u.id AS agent_id,
          c.home_city,
          c.carrier_email,
          c.mc_number,
          c.company_name,
          c.company_phone,
          u.username AS agent_name,
          u.email AS agent_email
      FROM 
          searches s
      LEFT JOIN (
          SELECT 
              search_id, 
              dead_head, 
              min_miles, 
              max_miles, 
              rpm, 
              min_rate, 
              round_to, 
              extra,
              ROW_NUMBER() OVER (PARTITION BY search_id ORDER BY min_miles) as rn
          FROM rates
      ) r ON s.id = r.search_id AND r.rn = 1
      LEFT JOIN trucks t ON s.truck_id = t.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      LEFT JOIN carriers c ON s.carrier_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY 
          s.id
          LIMIT ? OFFSET ?
    `, [limit, offset]);
    

    interface QueryRow extends RowDataPacket {
      length: number;
    }    
    res.json({
      data: rows,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalRows / limit),
        totalRows,
        hasMore: offset + (rows as QueryRow).length < totalRows
      }
    });
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;