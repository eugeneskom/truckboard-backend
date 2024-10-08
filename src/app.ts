import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import carrierListRoutes from './routes/carrierList'
import truckListRouter from './routes/truckList';
import driverListRouter from './routes/driverList';
import searchListRouter from './routes/searchList';
import rateListRouter from './routes/rateList'
import agentListRouter from './routes/agentList';
// import postingRouter from './routes/postings'
import addRoutes from './routes/addEntities'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import AuthRouter from './routes/auth'
dotenv.config();


const app: Application = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Enable cookies and authorization headers
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // 


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});





app.use('/api/agent', agentListRouter);

app.use('/api/trucks', truckListRouter);

app.use('/api/carriers', carrierListRoutes);

app.use('/api/drivers', driverListRouter);

app.use('/api/search', searchListRouter);

app.use('/api/rate', rateListRouter);

// app.use('/api/postings', postingRouter);

app.use('/api/add', addRoutes);
app.use('/api/auth', AuthRouter);



export default app;