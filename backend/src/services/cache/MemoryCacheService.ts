import { BaseCacheService, CacheOptions, CacheService } from './CacheService';

interface MemoryCacheEntry {
  value: any;
  tags?: string[];
  expiresAt?: number;
  createdAt: number;
}

export class MemoryCacheService extends BaseCacheService implements CacheService {
  private cache = new Map<string, MemoryCacheEntry>();
  private tagIndex = new Map<string, Set<string>>();
  private maxEntries: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxEntries = 1000, cleanupInterval = 60000) { // 1 minute cleanup
    super();
    this.maxEntries = maxEntries;

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupInterval);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.recordMiss();
      return null;
    }

    // Check if entry has expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.updateTagIndex(key, entry.tags, false);
      this.recordMiss();
      return null;
    }

    this.recordHit();
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    // Evict entries if we exceed max capacity (LRU)
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    const entry: MemoryCacheEntry = {
      value,
      tags: options.tags,
      expiresAt: options.ttl ? Date.now() + (options.ttl * 1000) : undefined,
      createdAt: Date.now()
    };

    // Remove old entry if exists
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.updateTagIndex(key, oldEntry.tags, false);
    }

    this.cache.set(key, entry);
    this.updateTagIndex(key, options.tags, true);
    this.recordSet();
  }

  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (entry) {
      this.updateTagIndex(key, entry.tags, false);
      this.cache.delete(key);
      this.recordDelete();
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
    this.recordDelete();
  }

  async invalidateTags(tags: string[]): Promise<void> {
    const keysToDelete = new Set<string>();

    for (const tag of tags) {
      const tagKeys = this.tagIndex.get(tag);
      if (tagKeys) {
        tagKeys.forEach(key => keysToDelete.add(key));
      }
    }

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.updateTagIndex(key, entry.tags, false);
        this.recordDelete();
      }
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if entry has expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.updateTagIndex(key, entry.tags, false);
      return false;
    }

    return true;
  }

  async getStats() {
    const baseStats = await super.getStats();

    // Calculate memory usage (rough estimate)
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length + JSON.stringify(entry.value).length;
    }

    return {
      ...baseStats,
      entries: this.cache.size,
      memory: {
        used: totalSize,
        max: this.maxEntries,
        utilization: Math.round((this.cache.size / this.maxEntries) * 100)
      }
    };
  }

  private updateTagIndex(key: string, tags?: string[], add = true): void {
    if (!tags) return;

    for (const tag of tags) {
      let tagKeys = this.tagIndex.get(tag);

      if (!tagKeys) {
        tagKeys = new Set();
        this.tagIndex.set(tag, tagKeys);
      }

      if (add) {
        tagKeys.add(key);
      } else {
        tagKeys.delete(key);
        // Clean up empty tag sets
        if (tagKeys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.updateTagIndex(oldestKey, entry.tags, false);
        this.cache.delete(oldestKey);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.updateTagIndex(key, entry.tags, false);
        this.cache.delete(key);
      }
    }

    if (keysToDelete.length > 0) {
      console.log(`🧹 Memory cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  // Graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}
