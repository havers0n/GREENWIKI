import { Request, Response, NextFunction } from 'express';

// Список полей, которые никогда не должны попадать в ответы об ошибках
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'supabase_key',
  'service_role_key',
  'access_token',
  'refresh_token',
  'session_token',
  'api_key',
  'private_key',
  'database_url',
  'connection_string'
];

// Функция для санитизации объекта ошибки
function sanitizeErrorDetails(obj: any, depth = 0): any {
  // Защита от слишком глубокой рекурсии
  if (depth > 10) {
    return '[RECURSION_LIMIT_EXCEEDED]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Проверяем, содержит ли строка чувствительные данные
    const lowerStr = obj.toLowerCase();
    for (const field of SENSITIVE_FIELDS) {
      if (lowerStr.includes(field)) {
        return '[REDACTED]';
      }
    }
    return obj;
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeErrorDetails(item, depth + 1));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Проверяем, является ли ключ чувствительным
      const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeErrorDetails(value, depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}

// Функция для создания безопасного сообщения об ошибке
function createSafeErrorMessage(error: any, includeDetails = false): {
  error: string;
  message?: string;
  details?: any;
  timestamp: string;
} {
  const timestamp = new Date().toISOString();

  // Базовое сообщение об ошибке
  const safeResponse: any = {
    error: 'An error occurred',
    timestamp
  };

  if (error instanceof Error) {
    safeResponse.error = error.message || 'Internal Server Error';
  } else if (typeof error === 'string') {
    safeResponse.error = error;
  } else if (error && typeof error === 'object') {
    if (error.message) {
      safeResponse.error = error.message;
    }
    if (includeDetails && error.details) {
      safeResponse.details = sanitizeErrorDetails(error.details);
    }
  }

  // В продакшене не показываем детали ошибок
  if (process.env.NODE_ENV === 'production' && !includeDetails) {
    safeResponse.error = 'Internal Server Error';
    delete safeResponse.details;
  }

  return safeResponse;
}

// Middleware для обработки ошибок базы данных
export function databaseErrorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  // Проверяем, является ли ошибка ошибкой базы данных
  if (error && error.code) {
    console.error('Database error:', {
      code: error.code,
      message: error.message,
      table: error.table,
      constraint: error.constraint,
      timestamp: new Date().toISOString()
    });

    // Обработка специфических ошибок базы данных
    switch (error.code) {
      case '23505': // unique_violation
        return res.status(409).json(createSafeErrorMessage('Resource already exists'));
      case '23503': // foreign_key_violation
        return res.status(400).json(createSafeErrorMessage('Invalid reference'));
      case '23502': // not_null_violation
        return res.status(400).json(createSafeErrorMessage('Required field is missing'));
      case 'PGRST116': // not found
        return res.status(404).json(createSafeErrorMessage('Resource not found'));
      default:
        return res.status(500).json(createSafeErrorMessage('Database error'));
    }
  }

  next(error);
}

// Middleware для обработки ошибок валидации
export function validationErrorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  if (error && error.name === 'ZodError') {
    console.error('Validation error:', {
      errors: error.errors,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      error: 'Validation failed',
      details: error.errors.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message
      })),
      timestamp: new Date().toISOString()
    });
  }

  next(error);
}

// Общий обработчик ошибок
export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  // Логируем ошибку для внутреннего использования
  console.error('Unhandled error:', {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString()
  });

  // Создаем безопасный ответ
  const safeResponse = createSafeErrorMessage(error);

  // Определяем HTTP статус код
  let statusCode = 500;
  if (error && typeof error === 'object') {
    if (error.statusCode) {
      statusCode = error.statusCode;
    } else if (error.status) {
      statusCode = error.status;
    }
  }

  // Убеждаемся, что статус код валидный
  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  res.status(statusCode).json(safeResponse);
}

// Middleware для обработки CORS ошибок (уже есть в index.ts, но добавляем для полноты)
export function corsErrorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  if (error && error.message === 'Not allowed by CORS') {
    console.warn('CORS violation:', {
      origin: req.get('Origin'),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed',
      timestamp: new Date().toISOString()
    });
  }

  next(error);
}
