import { Request, Response, NextFunction } from 'express';
import { CacheService, CacheStats } from '../services/cache/CacheService';
import { cacheService } from '../services/cache/CacheFactory';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  keyGenerator?: (req: Request) => string; // Custom key generator
  condition?: (req: Request) => boolean; // Condition to determine if request should be cached
}

interface CachedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
}

// Default key generator
function defaultKeyGenerator(req: Request): string {
  const { method, originalUrl, user } = req;

  // Only cache GET requests
  if (method !== 'GET') {
    return '';
  }

  // Include user ID in cache key for personalized content
  const userId = user?.id || 'anonymous';

  // Remove query parameters that shouldn't affect caching
  const url = new URL(originalUrl, 'http://localhost');
  const cacheParams = ['page', 'limit', 'sort', 'order'];
  const relevantParams = new URLSearchParams();

  for (const [key, value] of url.searchParams) {
    if (cacheParams.includes(key)) {
      relevantParams.set(key, value);
    }
  }

  const paramsString = relevantParams.toString();
  const baseKey = `${method}:${url.pathname}${paramsString ? `?${paramsString}` : ''}`;

  return `http:${userId}:${baseKey}`;
}

// Cache middleware factory
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    tags = [],
    keyGenerator = defaultKeyGenerator,
    condition = (req) => req.method === 'GET'
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if request should be cached
      if (!condition(req)) {
        return next();
      }

      const cacheKey = keyGenerator(req);
      if (!cacheKey) {
        return next();
      }

      // Try to get cached response
      const cached = await cacheService.get<CachedResponse>(cacheKey);
      if (cached) {
        // Check if cache is still fresh
        const age = Date.now() - cached.timestamp;
        const maxAge = ttl * 1000;

        if (age < maxAge) {
          console.log(`📋 Cache hit for ${cacheKey}`);

          // Restore headers
          Object.entries(cached.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
          });

          // Add cache metadata headers
          res.setHeader('X-Cache-Status', 'HIT');
          res.setHeader('X-Cache-Age', Math.floor(age / 1000));
          res.setHeader('X-Cache-TTL', ttl);

          return res.status(cached.statusCode).json(cached.body);
        } else {
          // Cache expired, remove it
          await cacheService.delete(cacheKey);
        }
      }

      console.log(`📝 Cache miss for ${cacheKey}`);

      // Store original response methods
      const originalJson = res.json;
      const originalSend = res.send;
      const originalStatus = res.status;
      let responseSent = false;
      let statusCode = 200;
      const headers: Record<string, string> = {};

      // Override response methods to capture the response
      res.json = function(body: any) {
        if (responseSent) return this;

        // Capture response data
        const responseData: CachedResponse = {
          statusCode,
          headers,
          body,
          timestamp: Date.now()
        };

        // Cache the response asynchronously (don't block response)
        cacheService.set(cacheKey, responseData, {
          ttl,
          tags: [...tags, 'http-response']
        }).catch(err => console.error('Cache write error:', err));

        responseSent = true;
        return originalJson.call(this, body);
      };

      res.send = function(body: any) {
        if (responseSent) return this;
        responseSent = true;
        return originalSend.call(this, body);
      };

      res.status = function(code: number) {
        statusCode = code;
        return originalStatus.call(this, code);
      };

      // Capture headers
      const originalSetHeader = res.setHeader;
      res.setHeader = function(name: string, value: string) {
        headers[name] = value;
        return originalSetHeader.call(this, name, value);
      };

      // Add cache metadata headers
      res.setHeader('X-Cache-Status', 'MISS');
      res.setHeader('X-Cache-TTL', ttl);

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
}

// Cache invalidation helpers
export const cacheHelpers = {
  // Invalidate cache by tags
  async invalidateTags(tags: string[]): Promise<void> {
    try {
      await cacheService.invalidateTags(tags);
      console.log(`🗑️  Invalidated cache tags: ${tags.join(', ')}`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  },

  // Invalidate specific cache key
  async invalidateKey(key: string): Promise<void> {
    try {
      await cacheService.delete(key);
      console.log(`🗑️  Invalidated cache key: ${key}`);
    } catch (error) {
      console.error('Cache key invalidation error:', error);
    }
  },

  // Clear all cache
  async clearAll(): Promise<void> {
    try {
      await cacheService.clear();
      console.log('🗑️  Cleared all cache');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },

  // Get cache statistics
  async getStats(): Promise<CacheStats | null> {
    try {
      return await cacheService.getStats();
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
};

// Entity-specific cache tags
export const cacheTags = {
  pages: (id?: string) => ['pages', ...(id ? [`page:${id}`] : [])] as string[],
  categories: (id?: string) => ['categories', ...(id ? [`category:${id}`] : [])] as string[],
  sections: (id?: string) => ['sections', ...(id ? [`section:${id}`] : [])] as string[],
  layouts: (id?: string) => ['layouts', ...(id ? [`layout:${id}`] : [])] as string[],
  templates: (id?: string) => ['templates', ...(id ? [`template:${id}`] : [])] as string[],
  users: (id?: string) => ['users', ...(id ? [`user:${id}`] : [])] as string[],
} as const;
