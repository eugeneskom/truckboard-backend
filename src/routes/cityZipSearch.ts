// src/routes/cityZipSearch.ts
import express, { Request, Response } from 'express';
import db from '../db';

const router = express.Router();

// Search by Zip Code
router.get('/search/zip/:zipcode', async (req: Request, res: Response) => {
  try {
    const { zipcode } = req.params;
    const query = `
      SELECT c.city, c.state_short, c.county, 
             GROUP_CONCAT(DISTINCT z.zip_code) as zip_codes, 
             GROUP_CONCAT(DISTINCT a.alias) as aliases
      FROM cities c
      JOIN zip_codes z ON c.id = z.city_id
      LEFT JOIN city_aliases a ON c.id = a.city_id
      WHERE z.zip_code = ?
      GROUP BY c.id
    `;
    const [results] = await db.query(query, [zipcode]);
    res.json(results);
  } catch (error) {
    console.error('Error in zip code search:', error);
    res.status(500).json({ error: 'An error occurred during the search' });
  }
});

// Search by City Name (with deduplication and limiting)
router.get('/search/city/:cityName', async (req: Request, res: Response) => {
  try {
    const { cityName } = req.params;
    const query = `
      (SELECT c.city, c.state_short, c.county, 
              GROUP_CONCAT(DISTINCT z.zip_code) as zip_codes, 
              GROUP_CONCAT(DISTINCT a.alias) as aliases
       FROM cities c
       LEFT JOIN zip_codes z ON c.id = z.city_id
       LEFT JOIN city_aliases a ON c.id = a.city_id
       WHERE c.city = ? OR a.alias = ?
       GROUP BY c.id)
      UNION
      (SELECT c.city, c.state_short, c.county, 
              GROUP_CONCAT(DISTINCT z.zip_code) as zip_codes, 
              GROUP_CONCAT(DISTINCT a.alias) as aliases
       FROM cities c
       LEFT JOIN zip_codes z ON c.id = z.city_id
       LEFT JOIN city_aliases a ON c.id = a.city_id
       WHERE c.city LIKE ? OR a.alias LIKE ?
       GROUP BY c.id)
      LIMIT 50
    `;
    const [results] = await db.query(query, [cityName, cityName, `%${cityName}%`, `%${cityName}%`]);
    res.json(results);
  } catch (error) {
    console.error('Error in city name search:', error);
    res.status(500).json({ error: 'An error occurred during the search' });
  }
});

// Search by City or Zip Code and State (with deduplication and limiting)
router.get('/search/:type/:term/:state', async (req: Request, res: Response) => {
  try {
    const { type, term, state } = req.params;
    let query = `
      SELECT c.city, c.state_short, c.county, 
             GROUP_CONCAT(DISTINCT z.zip_code) as zip_codes, 
             GROUP_CONCAT(DISTINCT a.alias) as aliases
      FROM cities c
      LEFT JOIN zip_codes z ON c.id = z.city_id
      LEFT JOIN city_aliases a ON c.id = a.city_id
      WHERE c.state_short = ?
    `;
    
    if (type === 'zip') {
      query += ' AND z.zip_code LIKE ?';
    } else {
      query += ' AND (c.city LIKE ? OR a.alias LIKE ?)';
    }
    
    query += ' GROUP BY c.id LIMIT 50';
    
    const params = [state, `%${term}%`];
    if (type !== 'zip') params.push(`%${term}%`);
    
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error in combined search:', error);
    res.status(500).json({ error: 'An error occurred during the search' });
  }
});

export default router;