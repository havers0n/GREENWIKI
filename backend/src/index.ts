import dotenv from 'dotenv'
dotenv.config()

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

import layoutRouter from './routes/layoutRoutes'
import categoryRouter from './routes/categoryRoutes'
import sectionRouter from './routes/sectionRoutes'
import pageRouter from './routes/pageRoutes'
import templatesRouter from './routes/templatesRoutes'
import healthRouter from './routes/healthRoutes'
import reusableBlocksRouter from './routes/reusableBlocksRoutes'

// Import cache services
import { cacheMiddleware, cacheHelpers } from './middleware/cacheMiddleware'
import { createCacheService } from './services/cache/CacheFactory'

// Import rate limiting
import { rateLimiters, rateLimitRollbackMiddleware } from './middleware/rateLimitMiddleware'

// Import logging
import {
  loggingMiddleware,
  errorLoggingMiddleware,
  securityLoggingMiddleware,
  performanceMiddleware
} from './middleware/loggingMiddleware'

// Import error handling
import {
  databaseErrorHandler,
  validationErrorHandler,
  errorHandler,
  corsErrorHandler
} from './middleware/errorHandler'

const app = express()

// Initialize cache service
let cacheService: any = null;
(async () => {
  try {
    cacheService = await createCacheService();
    console.log('✅ Cache service initialized');
  } catch (error) {
    console.error('❌ Cache service initialization failed:', error);
  }
})();

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(url => url.trim())
      : ['http://localhost:3000', 'http://localhost:5173'];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  maxAge: parseInt(process.env.CORS_MAX_AGE || '86400'), // 24 hours
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }))

// Performance monitoring (must be first)
app.use(performanceMiddleware())

// Security logging
app.use(securityLoggingMiddleware())

// Apply differentiated rate limiting to API routes
app.use('/api', rateLimiters.general)
app.use('/api/auth', rateLimiters.auth)
app.use('/api/admin', rateLimiters.admin)
app.use('/api/pages', rateLimiters.create)
app.use('/api/layout', rateLimiters.blocks)
app.use('/api/reusable-blocks', rateLimiters.blocks)

// Apply rate limit rollback middleware
app.use('/api', rateLimitRollbackMiddleware())

// Request logging for API routes
app.use('/api', loggingMiddleware())

// Enhanced health check with cache stats
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const cacheStats = cacheService ? await cacheHelpers.getStats() : null;

    const health = {
      ok: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cache: cacheStats ? {
        connected: cacheStats.redis?.connected ?? true,
        entries: cacheStats.entries,
        hitRate: cacheStats.hitRate,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        memory: cacheStats.redis?.memory ?? cacheStats.memory?.used,
        uptime: cacheStats.redis?.uptime
      } : null
    };

    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      ok: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
})

// Cache management endpoints
app.get('/cache/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await cacheHelpers.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats'
    });
  }
});

app.post('/cache/clear', async (_req: Request, res: Response) => {
  try {
    await cacheHelpers.clearAll();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

app.post('/cache/invalidate', async (req: Request, res: Response) => {
  try {
    const { tags } = req.body;
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'Tags array is required'
      });
    }

    await cacheHelpers.invalidateTags(tags);
    res.json({
      success: true,
      message: `Cache invalidated for tags: ${tags.join(', ')}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to invalidate cache'
    });
  }
});

// Health and monitoring routes
app.use('/health', healthRouter)

// API routes
app.use('/api/layout', layoutRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/sections', sectionRouter)
app.use('/api/pages', pageRouter)
app.use('/api/templates', templatesRouter)
app.use('/api/reusable-blocks', reusableBlocksRouter)

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' })
})

// Error logging middleware (must be before error handlers)
app.use(errorLoggingMiddleware())

// Specialized error handlers (order matters)
app.use(databaseErrorHandler)
app.use(validationErrorHandler)
app.use(corsErrorHandler)

// Final error handler (catch-all)
app.use(errorHandler)

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${PORT}`)
})
