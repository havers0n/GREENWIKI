import { Request, Response, NextFunction } from 'express';

export interface LoggingOptions {
  logRequests?: boolean;
  logErrors?: boolean;
  logPerformance?: boolean;
  excludePaths?: string[];
  includeHeaders?: boolean;
  includeBody?: boolean;
  includeQuery?: boolean;
  maxBodyLength?: number;
  performanceThreshold?: number; // Log slow requests above this threshold (ms)
}

interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  ip: string;
  userAgent?: string;
  userId?: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private options: LoggingOptions;

  constructor(options: LoggingOptions = {}) {
    this.options = {
      logRequests: true,
      logErrors: true,
      logPerformance: true,
      excludePaths: ['/health', '/favicon.ico'],
      includeHeaders: false,
      includeBody: false,
      includeQuery: true,
      maxBodyLength: 1000,
      performanceThreshold: 1000,
      ...options
    };
  }

  private shouldLogRequest(req: Request): boolean {
    if (!this.options.logRequests) return false;

    const path = req.path;
    if (this.options.excludePaths?.includes(path)) return false;

    return true;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Truncate large bodies
    const bodyString = JSON.stringify(sanitized);
    if (bodyString.length > (this.options.maxBodyLength || 1000)) {
      return `${bodyString.substring(0, this.options.maxBodyLength)}... [TRUNCATED]`;
    }

    return sanitized;
  }

  private createLogEntry(
    req: Request,
    res: Response,
    responseTime: number,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id
    };

    if (this.options.includeHeaders) {
      entry.headers = {};
      const headersToInclude = ['content-type', 'accept', 'accept-language', 'cache-control'];
      headersToInclude.forEach(header => {
        const value = req.get(header);
        if (value) {
          entry.headers![header] = value;
        }
      });
    }

    if (this.options.includeQuery && Object.keys(req.query).length > 0) {
      entry.query = req.query;
    }

    if (this.options.includeBody && req.body) {
      entry.body = this.sanitizeBody(req.body);
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack
      };
    }

    return entry;
  }

  logRequest(req: Request, res: Response, responseTime: number): void {
    if (!this.shouldLogRequest(req)) return;

    const entry = this.createLogEntry(req, res, responseTime);
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';

    console.log(`[${level}] ${entry.method} ${entry.url} ${entry.statusCode} ${entry.responseTime}ms`);

    // Log performance issues
    if (this.options.logPerformance && entry.responseTime > (this.options.performanceThreshold || 1000)) {
      console.warn(`[PERF] Slow request: ${entry.method} ${entry.url} took ${entry.responseTime}ms`);
    }
  }

  logError(req: Request, error: Error): void {
    if (!this.options.logErrors) return;

    const entry = this.createLogEntry(req, { statusCode: 500 } as Response, 0, error);

    console.error(`[ERROR] ${entry.method} ${entry.url}:`, {
      message: error.message,
      stack: error.stack,
      ip: entry.ip,
      userId: entry.userId,
      timestamp: entry.timestamp
    });
  }

  logSecurity(req: Request, message: string, details?: any): void {
    console.warn(`[SECURITY] ${message}:`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
      details
    });
  }
}

// Global logger instance
const logger = new Logger({
  logRequests: process.env.LOG_REQUESTS !== 'false',
  logErrors: process.env.LOG_ERRORS !== 'false',
  logPerformance: process.env.LOG_PERFORMANCE !== 'false',
  includeHeaders: process.env.LOG_HEADERS === 'true',
  includeBody: process.env.LOG_BODY === 'true',
  performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD || '1000')
});

export function loggingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;

    // Override response methods to capture response time
    res.json = function(body: any) {
      const responseTime = Date.now() - startTime;
      logger.logRequest(req, res, responseTime);
      return originalJson.call(this, body);
    };

    res.send = function(body: any) {
      const responseTime = Date.now() - startTime;
      logger.logRequest(req, res, responseTime);
      return originalSend.call(this, body);
    };

    res.end = function(chunk?: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      logger.logRequest(req, res, responseTime);
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

// Error logging middleware
export function errorLoggingMiddleware() {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.logError(req, error);
    next(error);
  };
}

// Security logging middleware
export function securityLoggingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log suspicious activities
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /eval\(/i, // Code injection
    ];

    const checkString = `${req.url} ${JSON.stringify(req.body || {})} ${JSON.stringify(req.query || {})}`;

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkString)) {
        logger.logSecurity(req, 'Suspicious request pattern detected', {
          pattern: pattern.source,
          url: req.url,
          body: req.body,
          query: req.query
        });
        break;
      }
    }

    // Log rate limit violations
    if (res.statusCode === 429) {
      logger.logSecurity(req, 'Rate limit exceeded', {
        limit: res.getHeader('X-RateLimit-Limit'),
        remaining: res.getHeader('X-RateLimit-Remaining'),
        reset: res.getHeader('X-RateLimit-Reset')
      });
    }

    next();
  };
}

// Performance monitoring middleware
export function performanceMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      if (responseTime > 1000) { // Log requests taking more than 1 second
        console.log(`[PERFORMANCE] ${req.method} ${req.originalUrl} took ${responseTime.toFixed(2)}ms`);
      }

      // Track memory usage for performance monitoring
      const memUsage = process.memoryUsage();
      if (memUsage.heapUsed > 100 * 1024 * 1024) { // Alert if heap > 100MB
        console.warn(`[MEMORY] High memory usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB heap used`);
      }
    });

    next();
  };
}

// Export logger instance for manual logging
export { logger };
