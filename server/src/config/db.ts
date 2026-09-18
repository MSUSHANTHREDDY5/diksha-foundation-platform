import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('MONGODB_URI environment variable is not defined. Skipping database connection initialization.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    // In production or strict environment, handle process termination as appropriate
  }
};
