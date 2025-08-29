import { CacheService } from './CacheService';
import { RedisCacheService } from './RedisCacheService';
import { MemoryCacheService } from './MemoryCacheService';

export class CacheFactory {
  private static instance: CacheService | null = null;
  private static isInitializing = false;

  static async createCache(): Promise<CacheService> {
    if (this.instance) {
      return this.instance;
    }

    if (this.isInitializing) {
      // Return a temporary memory cache while initializing
      return new MemoryCacheService(100, 30000);
    }

    this.isInitializing = true;

    try {
      // Try to create Redis cache first
      const redisCache = new RedisCacheService();

      // Wait a bit for connection
      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 3000); // 3 second timeout

        const checkConnection = () => {
          if ((redisCache as any).isConnected) {
            clearTimeout(timeout);
            resolve(true);
          } else {
            setTimeout(checkConnection, 100);
          }
        };

        checkConnection();
      });

      // Check if Redis is actually connected
      if ((redisCache as any).isConnected) {
        console.log('🚀 Using Redis cache service');
        this.instance = redisCache;
      } else {
        console.log('💾 Redis unavailable, falling back to memory cache');
        this.instance = new MemoryCacheService();
      }
    } catch (error) {
      console.error('❌ Cache initialization error:', error);
      console.log('💾 Using memory cache as fallback');
      this.instance = new MemoryCacheService();
    } finally {
      this.isInitializing = false;
    }

    return this.instance;
  }

  static getCache(): CacheService | null {
    return this.instance;
  }

  static async reset(): Promise<void> {
    if (this.instance) {
      if (this.instance instanceof RedisCacheService) {
        await (this.instance as RedisCacheService).disconnect();
      } else if (this.instance instanceof MemoryCacheService) {
        (this.instance as MemoryCacheService).destroy();
      }
      this.instance = null;
    }
    this.isInitializing = false;
  }
}

// Convenience function for creating cache
export async function createCacheService(): Promise<CacheService> {
  return CacheFactory.createCache();
}

// Export cache service singleton
export let cacheService: CacheService;

(async () => {
  try {
    cacheService = await createCacheService();
  } catch (error) {
    console.error('Failed to initialize cache service:', error);
    cacheService = new MemoryCacheService();
  }
})();
