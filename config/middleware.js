const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Skip successful requests
    skipFailedRequests: false     // Don't skip failed requests
  });
};

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Helmet configuration for security headers
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  },
  crossOriginEmbedderPolicy: false
};

// Morgan configuration for HTTP request logging
const morganConfig = {
  format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
};

module.exports = {
  helmet: () => helmet(helmetConfig),
  cors: () => cors(corsOptions),
  compression: () => compression(),
  morgan: () => morgan(morganConfig.format),
  rateLimiter: {
    general: createRateLimiter(
      parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    ),
    auth: createRateLimiter(15 * 60 * 1000, 20, 'Too many login attempts, please try again later.'), // Increased from 5 to 20
    api: createRateLimiter(60 * 1000, 100, 'API rate limit exceeded.') // Increased from 30 to 100
  }
}; 