import express, { Request, Response } from 'express';
import db from '../db';
const router = express.Router();

// Route to add a new carrier
router.post('/carriers', async (req: Request, res: Response) => {
  try {
    const {
      agent_id,
      company_name,
      carrier_email,
      mc_number,
      company_phone,
      spam,
      home_city,
      truck_type_spam, // Add this field to match your table structure
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO carriers 
      (agent_id, home_city, carrier_email, mc_number, company_name, company_phone, truck_type_spam, spam) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agent_id,
        home_city,
        carrier_email,
        mc_number,
        company_name,
        company_phone,
        truck_type_spam,
        spam,
      ],
    );

    res.status(201).json({ message: 'Carrier added successfully', carrier: result });
  } catch (error: unknown) {
    console.error(error);
    if(error instanceof Error) {
      res.status(500).json({ message: 'Error adding carrier', error: error.message });
    }
  }
});

// Route to add a new truck
router.post('/trucks', async (req: Request, res: Response) => {
  try {
    const { carrier_id, type, dims, payload, accessories } = req.body;
    const [result] = await db.query(
      'INSERT INTO trucks (carrier_id, type, dims, payload, accessories) VALUES (?, ?, ?, ?, ?)',
      [carrier_id, type, dims, payload, accessories],
    );
    res.status(201).json({ message: 'Truck added successfully', truck_id: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding truck' });
  }
});

// Route to add a new driver and assign to a truck
router.post('/drivers', async (req: Request, res: Response) => {
  try {
    const { carrier_id, truck_id, name, lastname, phone, email, perks } = req.body;
    const [result] = await db.query(
      'INSERT INTO drivers (carrier_id, truck_id, name, lastname, phone, email, perks) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [carrier_id, truck_id, name, lastname, phone, email, perks],
    );
    res
      .status(201)
      .json({ message: 'Driver added and assigned to truck successfully', driver_id: result });
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;
