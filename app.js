import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';

// Import constants
import { ENV, API_ENDPOINTS, HTTP_STATUS } from './utils/constants.js';

// Import response utilities
import responseUtils from './utils/response.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all routes
app.use(rateLimiter.general);

// Basic routes
app.get('/', (req, res) => {
  const data = {
    version: '1.0.0',
    environment: ENV.NODE_ENV,
    endpoints: {
      auth: API_ENDPOINTS.AUTH.BASE,
      users: API_ENDPOINTS.USERS.BASE,
      health: API_ENDPOINTS.SYSTEM.HEALTH
    }
  };
  responseUtils.success(res, data, 'Express API is running!');
});

app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: ENV.NODE_ENV,
    nodeVersion: process.version
  };
  responseUtils.success(res, healthData, 'Health check successful');
});

// API routes
app.use('/api/auth', rateLimiter.auth, authRoutes);
app.use('/api/users', rateLimiter.api, userRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  const errorData = {
    path: req.originalUrl,
    method: req.method
  };
  responseUtils.notFound(res, 'Route not found');
});

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;