import express, { Application, Request, Response } from 'express';
// import db from './db';
const app: Application = express();
import carrierListRoutes from './routes/carrierList'

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// Use the carrier list routes
app.use('/carrier-list', carrierListRoutes);


export default app;