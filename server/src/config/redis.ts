import Redis from 'ioredis';
import { config } from './index';

class MemoryStore {
  private store = new Map<string, string>();
  private ttls = new Map<string, NodeJS.Timeout>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      if (this.ttls.has(key)) clearTimeout(this.ttls.get(key));
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.ttls.delete(key);
      }, duration * 1000);
      this.ttls.set(key, timer);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    if (this.ttls.has(key)) {
      clearTimeout(this.ttls.get(key));
      this.ttls.delete(key);
    }
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }

  async incr(key: string): Promise<number> {
    const val = parseInt(this.store.get(key) || '0', 10) + 1;
    this.store.set(key, val.toString());
    return val;
  }

  async decr(key: string): Promise<number> {
    const val = parseInt(this.store.get(key) || '0', 10) - 1;
    const finalVal = Math.max(0, val);
    this.store.set(key, finalVal.toString());
    return finalVal;
  }
}

export class ResilientCacheService {
  private redis: Redis | null = null;
  private fallback = new MemoryStore();
  private isRedisConnected = false;

  constructor() {
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      this.isRedisConnected = false;
      return;
    }
    try {
      this.redis = new Redis(config.redis.url, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        lazyConnect: true,
        connectTimeout: 1000
      });

      this.redis.on('error', () => {
        this.isRedisConnected = false;
      });

      this.redis.connect().then(() => {
        this.isRedisConnected = true;
        console.log('✅ Redis connected successfully.');
      }).catch(() => {
        this.isRedisConnected = false;
      });
    } catch {
      this.isRedisConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        return await this.fallback.get(key);
      }
    }
    return await this.fallback.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        if (ttlSeconds) {
          await this.redis.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.redis.set(key, value);
        }
        return;
      } catch {
        // Fallthrough
      }
    }
    await this.fallback.set(key, value, ttlSeconds ? 'EX' : undefined, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.redis) {
      try {
        await this.redis.del(key);
        return;
      } catch {
        // Fallthrough
      }
    }
    await this.fallback.del(key);
  }

  async incr(key: string): Promise<number> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.incr(key);
      } catch {
        // Fallthrough
      }
    }
    return await this.fallback.incr(key);
  }

  async decr(key: string): Promise<number> {
    if (this.isRedisConnected && this.redis) {
      try {
        return await this.redis.decr(key);
      } catch {
        // Fallthrough
      }
    }
    return await this.fallback.decr(key);
  }
}

export const cacheService = new ResilientCacheService();
export function getRedisClient() {
  return cacheService;
}
