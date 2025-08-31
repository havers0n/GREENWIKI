import Redis from 'ioredis';

interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPrefix: string;
}

/**
 * Сервис кеширования для оптимизации производительности API
 * Использует Redis для хранения кешированных данных
 */
export class CacheService {
  private redis: Redis | null = null;
  private isDevelopmentMode: boolean;
  private defaultConfig: CacheConfig = {
    ttl: 300, // 5 минут по умолчанию
    keyPrefix: 'cms_cache:',
  };

  constructor() {
    this.isDevelopmentMode = process.env.NODE_ENV !== 'production';

    if (this.isDevelopmentMode) {
      console.log('[INFO] Redis cache is disabled in development mode');
      return;
    }

    // Инициализация Redis клиента только в production
    const redisConfig: any = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10),
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    this.redis = new Redis(redisConfig);

    // Обработка ошибок подключения
    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  /**
   * Генерирует ключ кеша на основе префикса и параметров
   */
  private generateKey(config: CacheConfig, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');

    return `${config.keyPrefix}${sortedParams}`;
  }

  /**
   * Получает данные из кеша
   */
  async get<T>(key: string, config: Partial<CacheConfig> = {}): Promise<T | null> {
    if (this.isDevelopmentMode) {
      return null;
    }

    try {
      if (!this.redis) {
        return null;
      }

      const finalConfig = { ...this.defaultConfig, ...config };
      const cacheKey = this.generateKey(finalConfig, { key });

      const cachedData = await this.redis.get(cacheKey);
      if (!cachedData) {
        return null;
      }

      return JSON.parse(cachedData) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Сохраняет данные в кеш
   */
  async set<T>(
    key: string,
    data: T,
    config: Partial<CacheConfig> = {}
  ): Promise<void> {
    if (this.isDevelopmentMode) {
      return;
    }

    try {
      if (!this.redis) {
        return;
      }

      const finalConfig = { ...this.defaultConfig, ...config };
      const cacheKey = this.generateKey(finalConfig, { key });

      await this.redis.setex(cacheKey, finalConfig.ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Удаляет данные из кеша
   */
  async del(key: string, config: Partial<CacheConfig> = {}): Promise<void> {
    if (this.isDevelopmentMode) {
      return;
    }

    try {
      if (!this.redis) {
        return;
      }

      const finalConfig = { ...this.defaultConfig, ...config };
      const cacheKey = this.generateKey(finalConfig, { key });

      await this.redis.del(cacheKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Очищает весь кеш с определенным префиксом
   */
  async clear(prefix: string): Promise<void> {
    if (this.isDevelopmentMode) {
      return;
    }

    try {
      if (!this.redis) {
        return;
      }

      const keys = await this.redis.keys(`${this.defaultConfig.keyPrefix}${prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Проверяет существование ключа в кеше
   */
  async exists(key: string, config: Partial<CacheConfig> = {}): Promise<boolean> {
    if (this.isDevelopmentMode) {
      return false;
    }

    try {
      if (!this.redis) {
        return false;
      }

      const finalConfig = { ...this.defaultConfig, ...config };
      const cacheKey = this.generateKey(finalConfig, { key });

      const result = await this.redis.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Закрывает соединение с Redis
   */
  async close(): Promise<void> {
    if (this.isDevelopmentMode || !this.redis) {
      return;
    }

    await this.redis.quit();
  }
}

// Создаем singleton экземпляр
export const cacheService = new CacheService();
