import express from 'express';
import cors from 'cors';
import config from './src/config/environment.js';
import connectDatabase from './src/config/database.js';
import errorHandler from './src/middleware/errorHandler.js';
import routes from './src/routes/maincontroller.js';

const app = express();

app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Connect before handling each request (idempotent — skips if already connected)
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api', routes);

app.use(errorHandler);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start HTTP server (Render, Railway, local dev — any non-serverless environment)
const server = app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
  console.log(`Health check: http://localhost:${config.server.port}/api/health`);
});

const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
