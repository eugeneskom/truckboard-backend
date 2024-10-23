import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import carrierListRoutes from './routes/carrierList';
import truckListRouter from './routes/truckList';
import driverListRouter from './routes/driverList';
import searchListRouter from './routes/searchList';
import rateListRouter from './routes/rateList'
import usersRoute from './routes/usersList';
import addRoutes from './routes/addEntities'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import AuthRouter from './routes/auth';
import AggregatedRoute from './routes/aggregatedData';
import updateRoute from './routes/updateData';
import cityZipSearchRoute from './routes/cityZipSearch';
import truckTypesRoute from './routes/truckTypes'


dotenv.config();


const app: Application = express();



app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://truckboard.remberglogistics.com/'], // Allow only this origin in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Enables cookies and authorization headers
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





app.use('/api/users', usersRoute);

app.use('/api/trucks', truckListRouter);

app.use('/api/carriers', carrierListRoutes);

app.use('/api/drivers', driverListRouter);

app.use('/api/searches', searchListRouter);

app.use('/api/rates', rateListRouter);

app.use('/api/add', addRoutes);

app.use('/api/auth', AuthRouter);

app.use('/api/aggregated', AggregatedRoute);

app.use('/api/update-data', updateRoute);

app.use('/api', cityZipSearchRoute);
app.use('/api/truck-types', truckTypesRoute);


export default app;