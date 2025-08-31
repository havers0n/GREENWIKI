import Redis from 'ioredis';
import { BaseCacheService, CacheOptions, CacheService, CacheStats } from './CacheService';

interface RedisCacheEntry {
  value: any;
  tags?: string[];
  expiresAt?: number;
}

export class RedisCacheService extends BaseCacheService implements CacheService {
  private client: Redis | null = null;
  private tagIndexPrefix = 'tag:';
  private isConnected = false;
  private isDevelopmentMode: boolean;

  constructor(redisUrl?: string) {
    super();

    this.isDevelopmentMode = process.env.NODE_ENV !== 'production';

    if (this.isDevelopmentMode) {
      console.log('[INFO] Redis cache is disabled in development mode');
      return;
    }

    const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(url, { lazyConnect: true });

    this.client.on('connect', () => {
      console.log('✅ Redis cache connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.warn('⚠️  Redis cache connection error:', err.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('❌ Redis cache disconnected');
      this.isConnected = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      this.recordMiss();
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (!data) {
        this.recordMiss();
        return null;
      }

      const entry: RedisCacheEntry = JSON.parse(data);

      // Check if entry has expired
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.delete(key);
        this.recordMiss();
        return null;
      }

      this.recordHit();
      return entry.value as T;
    } catch (error) {
      console.error('Redis cache get error:', error);
      this.recordMiss();
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      return;
    }

    try {
      const entry: RedisCacheEntry = {
        value,
        ...(options.tags && { tags: options.tags }),
        ...(options.ttl && { expiresAt: Date.now() + (options.ttl * 1000) })
      };

      const serialized = JSON.stringify(entry);

      if (options.ttl) {
        await this.client.setex(key, options.ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      // Index tags for invalidation
      if (options.tags) {
        for (const tag of options.tags) {
          await this.client.sadd(`${this.tagIndexPrefix}${tag}`, key);
        }
      }

      this.recordSet();
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      return;
    }

    try {
      // Get the entry to clean up tags
      const data = await this.client.get(key);
      if (data) {
        const entry: RedisCacheEntry = JSON.parse(data);
        if (entry.tags) {
          for (const tag of entry.tags) {
            await this.client.srem(`${this.tagIndexPrefix}${tag}`, key);
          }
        }
      }

      await this.client.del(key);
      this.recordDelete();
    } catch (error) {
      console.error('Redis cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.flushall();
      this.recordDelete();
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }

  async invalidateTags(tags: string[]): Promise<void> {
    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      return;
    }

    try {
      for (const tag of tags) {
        const keys = await this.client.smembers(`${this.tagIndexPrefix}${tag}`);

        if (keys.length > 0) {
          // Delete all keys with this tag
          await this.client.del(...keys);
          // Remove the tag index
          await this.client.del(`${this.tagIndexPrefix}${tag}`);
        }
      }
    } catch (error) {
      console.error('Redis cache invalidate tags error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      return false;
    }

    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis cache has error:', error);
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    const baseStats = await super.getStats();

    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      return {
        ...baseStats,
        entries: 0,
        redis: {
          connected: false,
          memory: null,
          uptime: null
        }
      };
    }

    try {
      const info = await this.client.info();
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);

      return {
        ...baseStats,
        entries: await this.getEntryCount(),
        redis: {
          connected: true,
          memory: memoryMatch && memoryMatch[1] ? parseInt(memoryMatch[1], 10) : null,
          uptime: uptimeMatch && uptimeMatch[1] ? parseInt(uptimeMatch[1], 10) : null
        }
      };
    } catch (error) {
      return {
        ...baseStats,
        entries: 0,
        redis: {
          connected: false,
          memory: null,
          uptime: null
        }
      };
    }
  }

  private async getEntryCount(): Promise<number> {
    if (this.isDevelopmentMode || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys('*');
      // Filter out tag index keys
      return keys.filter(key => !key.startsWith(this.tagIndexPrefix)).length;
    } catch (error) {
      return 0;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    if (this.isDevelopmentMode || !this.isConnected || !this.client) {
      return;
    }

    await this.client.quit();
  }
}
