import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import studentRoutes from './modules/student/student.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// Global Error Handler
app.use(errorHandler);

// Database connection & listener (only when not running unit tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
