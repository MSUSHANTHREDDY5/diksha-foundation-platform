import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/health.routes.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoutes);

// Database connection
connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
