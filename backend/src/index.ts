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

// Middleware
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Performance monitoring (must be first)
app.use(performanceMiddleware())

// Security logging
app.use(securityLoggingMiddleware())

// Apply rate limiting to API routes
app.use('/api', rateLimiters.general)
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

// Error logging middleware (must be before final error handler)
app.use(errorLoggingMiddleware())

// Final error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as { statusCode?: number; message?: string; details?: unknown }
  const status = e?.statusCode || 500
  res.status(status).json({
    error: e?.message || 'Internal Server Error',
    details: e?.details ?? undefined
  })
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${PORT}`)
})
