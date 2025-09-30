require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const realtorRoutes = require('./routes/realtorRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const hostelRoomRoutes = require('./routes/hostelRoomRoutes');
const amenityRoutes = require('./routes/amenitiesRoutes');
const resverationRoutes = require('./routes/reservationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const errorHandler = require('./middleware/errorHandler');


const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin:true,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request logging
app.use(morgan('dev'));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route with database check
app.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT 1 + 1 AS solution');
    res.json({ 
      message: 'Hostella API is running',
      database: 'Connected',
      testQuery: rows[0].solution === 2 ? 'Successful' : 'Unexpected result'
    });
  } catch (err) {
    res.status(500).json({
      message: 'Hostella API is running',
      database: 'Connection error',
      error: err.message
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      databaseProvider: 'Neon PostgreSQL'
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/realtors', realtorRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/hostels', hostelRoomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Server shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  db.end().then(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  db.end().then(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

module.exports = app;