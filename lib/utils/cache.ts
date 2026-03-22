/**
 * Simple in-memory cache for recommendations and frequently accessed data
 * In production, consider using Redis for distributed caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache data
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate cache for a specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache by pattern (prefix)
   */
  invalidateByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const recommendationCache = new SimpleCache(500);

/**
 * Cache key generators
 */
export const cacheKeys = {
  trending: (period: string, limit: number) => `trending:${period}:${limit}`,
  similar: (destinationId: string, limit: number) => `similar:${destinationId}:${limit}`,
  forYou: (userId: string, limit: number, method: string) => `for-you:${userId}:${limit}:${method}`,
  byTag: (tag: string, limit: number) => `by-tag:${tag}:${limit}`,
  search: (query: string, filters: string) => `search:${query}:${filters}`,
};

/**
 * Cache TTL constants (in milliseconds)
 */
export const cacheTTL = {
  trending: 10 * 60 * 1000, // 10 minutes
  similar: 30 * 60 * 1000, // 30 minutes
  forYou: 5 * 60 * 1000, // 5 minutes (more dynamic)
  byTag: 15 * 60 * 1000, // 15 minutes
  search: 5 * 60 * 1000, // 5 minutes
};

/**
 * Invalidate related caches when data changes
 */
export const invalidateCaches = {
  onDestinationUpdate: (destinationId: string) => {
    recommendationCache.invalidateByPattern(`similar:${destinationId}`);
    recommendationCache.invalidateByPattern('trending:');
    recommendationCache.invalidateByPattern('search:');
  },
  
  onReviewCreate: (destinationId: string, userId: string) => {
    recommendationCache.invalidateByPattern(`for-you:${userId}`);
    recommendationCache.invalidateByPattern('trending:');
  },
  
  onDestinationView: () => {
    // Don't invalidate immediately on views, wait for periodic refresh
    // recommendationCache.invalidateByPattern('trending:');
  },
};

export default recommendationCache;

