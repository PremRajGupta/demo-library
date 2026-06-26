import redis from 'redis';

class CacheService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || null
      });

      this.client.on('error', (err) => console.error('Redis error:', err));
      this.client.on('connect', () => {
        console.log('✓ Redis cache connected');
        this.connected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.warn('⚠ Redis connection failed:', error.message);
      console.warn('  Caching disabled - app will work without cache');
      this.connected = false;
    }
  }

  /**
   * Set cache value
   * @param {String} key - Cache key
   * @param {Any} value - Value to cache
   * @param {Number} ttl - Time to live in seconds (default: 300 = 5 min)
   */
  async set(key, value, ttl = 300) {
    if (!this.connected) return;
    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Get cache value
   * @param {String} key - Cache key
   * @returns {Any} Cached value or null
   */
  async get(key) {
    if (!this.connected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache key
   * @param {String} key - Cache key
   */
  async delete(key) {
    if (!this.connected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache keys matching pattern
   * @param {String} pattern - Pattern like "branch:*"
   */
  async clearPattern(pattern) {
    if (!this.connected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async flush() {
    if (!this.connected) return;
    try {
      await this.client.flushDb();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.connected) return { status: 'disconnected' };
    try {
      const info = await this.client.info();
      return {
        status: 'connected',
        info: info
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

export default new CacheService();
