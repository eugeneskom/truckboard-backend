import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import carrierListRoutes from './routes/carrierList'
import truckListRouter from './routes/truckList';
const app: Application = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.use('/api/truck-list', truckListRouter);

// Use the carrier list routes
app.use('/api/carrier-list', carrierListRoutes);


export default app;