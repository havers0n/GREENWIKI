import { Router, Request, Response } from 'express';
import { cacheHelpers } from '../middleware/cacheMiddleware';
import { logger } from '../middleware/loggingMiddleware';

const router = Router();

// Basic health check
router.get('/', async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check with all system metrics
router.get('/detailed', async (_req: Request, res: Response) => {
  try {
    const cacheStats = await cacheHelpers.getStats();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',

      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000), // ms
          system: Math.round(cpuUsage.system / 1000), // ms
        }
      },

      cache: cacheStats ? {
        connected: cacheStats.redis?.connected ?? true,
        entries: cacheStats.entries,
        hitRate: cacheStats.hitRate,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        memory: cacheStats.redis?.memory ?? cacheStats.memory?.used,
        uptime: cacheStats.redis?.uptime
      } : null,

      database: {
        status: 'unknown', // Would be checked with actual DB connection
        lastCheck: new Date().toISOString()
      }
    };

    // Determine overall health status
    let statusCode = 200;
    if (!cacheStats || cacheStats.hitRate < 50) {
      health.status = 'degraded';
      statusCode = 200; // Still OK, but degraded
    }

    if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // > 500MB
      health.status = 'warning';
      statusCode = 200;
    }

    res.status(statusCode).json(health);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.logSecurity(_req, 'Health check failed', { error: errorMessage });
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: errorMessage
    });
  }
});

// Readiness probe for Kubernetes
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    const cacheStats = await cacheHelpers.getStats();
    const isCacheReady = cacheStats && cacheStats.redis?.connected !== false;

    if (isCacheReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Cache service not available'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      reason: 'Health check error'
    });
  }
});

// Liveness probe for Kubernetes
router.get('/live', async (_req: Request, res: Response) => {
  // Simple liveness check - if the server is responding, it's alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint for monitoring systems (Prometheus format)
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const cacheStats = await cacheHelpers.getStats();
    const memoryUsage = process.memoryUsage();

    let metrics = '# HELP cms_cache_hits_total Total number of cache hits\n';
    metrics += '# TYPE cms_cache_hits_total counter\n';
    metrics += `cms_cache_hits_total ${cacheStats?.hits || 0}\n\n`;

    metrics += '# HELP cms_cache_misses_total Total number of cache misses\n';
    metrics += '# TYPE cms_cache_misses_total counter\n';
    metrics += `cms_cache_misses_total ${cacheStats?.misses || 0}\n\n`;

    metrics += '# HELP cms_cache_hit_rate Cache hit rate percentage\n';
    metrics += '# TYPE cms_cache_hit_rate gauge\n';
    metrics += `cms_cache_hit_rate ${cacheStats?.hitRate || 0}\n\n`;

    metrics += '# HELP cms_memory_heap_used_bytes Memory heap used in bytes\n';
    metrics += '# TYPE cms_memory_heap_used_bytes gauge\n';
    metrics += `cms_memory_heap_used_bytes ${memoryUsage.heapUsed}\n\n`;

    metrics += '# HELP cms_uptime_seconds Application uptime in seconds\n';
    metrics += '# TYPE cms_uptime_seconds gauge\n';
    metrics += `cms_uptime_seconds ${process.uptime()}\n\n`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(metrics);
  } catch (error) {
    res.status(500).send('# Error collecting metrics\n');
  }
});

// System info endpoint
router.get('/info', async (_req: Request, res: Response) => {
  res.json({
    application: {
      name: 'my-forum-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    build: {
      timestamp: new Date().toISOString(),
      commit: process.env.GIT_COMMIT || 'unknown'
    }
  });
});

export default router;
