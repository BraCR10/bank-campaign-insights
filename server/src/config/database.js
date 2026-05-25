import mongoose from 'mongoose';
import config from './environment.js';

const connectDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };

    await mongoose.connect(config.mongodb.uri, options);
    console.log('Database connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('Database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Database disconnected');
    });

  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    throw error;
  }
};

export const getDatabaseStatus = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[state] || 'unknown';
};

export default connectDatabase;
