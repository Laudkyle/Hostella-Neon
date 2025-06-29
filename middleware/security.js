const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// CORS configuration
exports.corsMiddleware = cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
});

// Rate limiting
exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later'
});

// Security headers
exports.secureHeaders = helmet();

// XSS protection
exports.xssProtection = xss();

// HTTP Parameter Pollution protection
exports.hppProtection = hpp();