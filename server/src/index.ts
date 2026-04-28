import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';import workoutRoutes from './routes/workouts';
import exerciseRoutes from './routes/exercises';
import userRoutes from './routes/users';
import progressRoutes from './routes/progress';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

//testing
import pool from './db/index';

pool.connect()
  .then(() => console.log('Connected to Supabase database!'))
  .catch((err) => console.error('Database connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

