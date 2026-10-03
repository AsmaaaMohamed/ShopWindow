

export class CacheKeys {
  private static readonly NS = 'catalog:v1';
  private static readonly AUTH_NS = 'auth:v1';
  // Products
  static product(id: string): string {
    return `${this.NS}:product:${id}`;
  }

  static productSlug(slug: string): string {
    return `${this.NS}:product:slug:${slug}`;
  }

  // Lists
  static list(hash: string): string {
    return `${this.NS}:list:${hash}`;
  }

  static listVersion(): string {
    return `${this.NS}:list:version`;
  }

  // Categories
  static categories(): string {
    return `${this.NS}:categories`;
  }

  static category(id: string): string {
    return `${this.NS}:category:${id}`;
  }

  // Negative Cache
  static negativeProduct(id: string): string {
    return `${this.NS}:negative:product:${id}`;
  }

  static negativeSlug(slug: string): string {
    return `${this.NS}:negative:slug:${slug}`;
  }

  // Locks
  static productLock(id: string): string {
    return `${this.NS}:lock:product:${id}`;
  }

  static listLock(hash: string): string {
    return `${this.NS}:lock:list:${hash}`;
  }

  // Stats
  static hits(): string {
    return `${this.NS}:stats:hits`;
  }

  static misses(): string {
    return `${this.NS}:stats:misses`;
  }

  static ratio(): string {
    return `${this.NS}:stats:ratio`;
  }
  static refreshToken(userId: string): string {
    return `${this.AUTH_NS}:refresh:user:${userId}`;
  }
}
