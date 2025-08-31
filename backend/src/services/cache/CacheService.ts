export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

/**
 * Тип для статистики кеширования, который включает опциональные поля для Redis и Memory
 */
export type CacheStats = {
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
  redis?: {
    connected: boolean;
    memory: number | null;
    uptime: number | null;
  };
  memory?: {
    used: number;
    max?: number;
    utilization?: number;
  };
};

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  invalidateTags(tags: string[]): Promise<void>;
  has(key: string): Promise<boolean>;
  getStats(): Promise<CacheStats>;
}

// Base cache service with common functionality
export abstract class BaseCacheService implements CacheService {
  protected stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  abstract get<T>(key: string): Promise<T | null>;
  abstract set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract invalidateTags(tags: string[]): Promise<void>;
  abstract has(key: string): Promise<boolean>;

  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      entries: 0 // Will be overridden in implementations
    };
  }

  protected recordHit() {
    this.stats.hits++;
  }

  protected recordMiss() {
    this.stats.misses++;
  }

  protected recordSet() {
    this.stats.sets++;
  }

  protected recordDelete() {
    this.stats.deletes++;
  }

  // Helper method to generate cache keys
  static generateKey(namespace: string, ...parts: (string | number)[]): string {
    return `${namespace}:${parts.join(':')}`;
  }

  // Helper method to create cache tags for different entities
  static createEntityTags(entityType: string, entityId?: string | number): string[] {
    const tags = [`${entityType}`];
    if (entityId) {
      tags.push(`${entityType}:${entityId}`);
    }
    return tags;
  }
}
