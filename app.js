import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

// Import constants
import { ENV, API_ENDPOINTS, HTTP_STATUS } from './utils/constants.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ 
    message: 'Express API is running!',
    version: '1.0.0',
    environment: ENV.NODE_ENV,
    endpoints: {
      auth: API_ENDPOINTS.AUTH.BASE,
      users: API_ENDPOINTS.USERS.BASE,
      health: API_ENDPOINTS.SYSTEM.HEALTH
    }
  });
});

app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: ENV.NODE_ENV,
    nodeVersion: process.version
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;