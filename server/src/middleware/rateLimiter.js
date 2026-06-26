import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

// Basic rate limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true // Don't count successful logins
});

// Upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: 'Upload limit exceeded, please try again later.'
});

/**
 * Advanced rate limiter using Redis (production)
 * Requires Redis to be running
 */
export const createRedisLimiter = (redisClient) => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:' // rate limit prefix
    }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    message: 'API rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * API Key based rate limiter
 * Different limits per API key tier
 */
export const apiKeyRateLimiter = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // In production, fetch API key from database
  // For now, use default limits
  const limits = {
    starter: 100,      // requests per hour
    professional: 1000,
    enterprise: 10000
  };

  // Add to request for downstream use
  req.apiKeyTier = 'professional'; // Get from DB
  req.rateLimit = limits[req.apiKeyTier];

  next();
};

/**
 * Per-endpoint rate limiter
 * Apply specific limits to sensitive endpoints
 */
export const createCustomLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    message: `Rate limit exceeded: ${max} requests per ${windowMs / 1000} seconds`,
    standardHeaders: true,
    legacyHeaders: false
  });
};

export default {
  apiLimiter,
  loginLimiter,
  uploadLimiter,
  createRedisLimiter,
  apiKeyRateLimiter,
  createCustomLimiter
};
