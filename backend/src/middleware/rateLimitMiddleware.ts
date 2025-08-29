import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache/CacheService';
import { cacheService } from '../services/cache/CacheFactory';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
  message?: string; // Custom error message
  statusCode?: number; // HTTP status code for rate limit exceeded
  headers?: boolean; // Add rate limit headers to response
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// Default key generator based on IP address
function defaultKeyGenerator(req: Request): string {
  const ip = req.ip ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             (req as any).connection?.socket?.remoteAddress ||
             'unknown';

  return `ratelimit:${ip}`;
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    headers = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `ratelimit:${keyGenerator(req)}`;
      const now = Date.now();
      const windowStart = Math.floor(now / windowMs) * windowMs;

      // Get current rate limit data
      const existingData = await cacheService.get<RateLimitData>(key);
      const resetTime = windowStart + windowMs;

      let currentCount = 0;

      if (existingData && existingData.resetTime === resetTime) {
        currentCount = existingData.count;
      } else if (existingData && existingData.resetTime < now) {
        // Window has expired, reset counter
        currentCount = 0;
      }

      // Check if limit exceeded
      if (currentCount >= maxRequests) {
        if (headers) {
          res.setHeader('X-RateLimit-Limit', maxRequests.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', resetTime.toString());
          res.setHeader('Retry-After', Math.ceil((resetTime - now) / 1000).toString());
        }

        return res.status(statusCode).json({
          error: message,
          retryAfter: Math.ceil((resetTime - now) / 1000)
        });
      }

      // Increment counter
      const newData: RateLimitData = {
        count: currentCount + 1,
        resetTime
      };

      await cacheService.set(key, newData, {
        ttl: Math.ceil(windowMs / 1000),
        tags: ['ratelimit']
      });

      // Add headers
      if (headers) {
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', (maxRequests - newData.count).toString());
        res.setHeader('X-RateLimit-Reset', resetTime.toString());
      }

      // Store rate limit info for potential rollback
      (req as any).rateLimitKey = key;
      (req as any).rateLimitData = newData;

      // Continue to next middleware
      next();

    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Continue without rate limiting on error
      next();
    }
  };
}

// Middleware to rollback rate limit on failed requests
export function rateLimitRollbackMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;
    const originalStatus = res.status;

    let statusCode = 200;

    res.status = function(code: number) {
      statusCode = code;
      return originalStatus.call(this, code);
    };

    res.json = function(body: any) {
      // Rollback rate limit for failed requests (4xx, 5xx)
      if (statusCode >= 400 && (req as any).rateLimitKey) {
        try {
          const key = (req as any).rateLimitKey;
          const data = (req as any).rateLimitData as RateLimitData;

          if (data && data.count > 0) {
            const rollbackData: RateLimitData = {
              ...data,
              count: Math.max(0, data.count - 1)
            };

            cacheService.set(key, rollbackData, {
              ttl: Math.ceil((data.resetTime - Date.now()) / 1000),
              tags: ['ratelimit']
            }).catch(err => console.error('Rate limit rollback error:', err));
          }
        } catch (error) {
          console.error('Rate limit rollback failed:', error);
        }
      }

      return originalJson.call(this, body);
    };

    res.send = function(body: any) {
      // Same rollback logic for send method
      if (statusCode >= 400 && (req as any).rateLimitKey) {
        try {
          const key = (req as any).rateLimitKey;
          const data = (req as any).rateLimitData as RateLimitData;

          if (data && data.count > 0) {
            const rollbackData: RateLimitData = {
              ...data,
              count: Math.max(0, data.count - 1)
            };

            cacheService.set(key, rollbackData, {
              ttl: Math.ceil((data.resetTime - Date.now()) / 1000),
              tags: ['ratelimit']
            }).catch(err => console.error('Rate limit rollback error:', err));
          }
        } catch (error) {
          console.error('Rate limit rollback failed:', error);
        }
      }

      return originalSend.call(this, body);
    };

    next();
  };
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // General API rate limiting
  general: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Strict rate limiting for auth endpoints
  auth: rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    skipFailedRequests: false
  }),

  // Rate limiting for file uploads
  upload: rateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    message: 'Upload limit exceeded, please try again later.'
  }),

  // Rate limiting for search endpoints
  search: rateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    message: 'Search rate limit exceeded, please slow down.'
  }),

  // Very strict rate limiting for admin endpoints
  admin: rateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Admin API rate limit exceeded.'
  })
};

// Helper function to create custom rate limiter
export function createRateLimiter(options: RateLimitOptions) {
  return rateLimitMiddleware(options);
}
