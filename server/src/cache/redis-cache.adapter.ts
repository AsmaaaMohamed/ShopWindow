import { Injectable, Logger } from "@nestjs/common";
import { CachePort } from "./cache.port.js";
import { RedisService } from "../redis/redis.service.js";

@Injectable()
export class RedisCacheAdapter implements CachePort {
    private readonly logger = new Logger(RedisCacheAdapter.name);
    private readonly operationTimeout = Number(
        process.env.REDIS_OPERATION_TIMEOUT_MS ?? 150,
    );
    constructor(private readonly redis: RedisService) {}
    public async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.withTimeout(this.redis.get(key));

            if (value === null) {
                return null;
            }

            try {
                return JSON.parse(value) as T;
            } catch (error) {
                // log error
                console.error(error);
                this.logger.warn(`Invalid JSON in cache key: ${key}`);
                await this.delete(key);
                return null;
            }
        } catch (error) {
            this.logFailure('get', key, error);
            return null;
        }
    }
    public async set<T>(
        key: string,
        value: T,
        ttl?: number,
        ): Promise<void> {
            try {
                const serialized = JSON.stringify(value);
                if (serialized === undefined) return;
                if (ttl && ttl > 0) {
                    await this.withTimeout(this.redis.set(key, serialized, 'EX', ttl));
                }
                else
                    await this.withTimeout(this.redis.set(key, serialized));
            }
            catch (error) {
                // log error
                this.logFailure('set', key, error);
            }
        
    }
    async delete(key: string): Promise<void> {
        try {
            await this.withTimeout(this.redis.del(key));
        } catch (error) {
            // log error
            this.logFailure('delete', key, error);
        }
    }
    private logFailure(operation: string, key: string, err: unknown): void {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Cache ${operation} failed for key "${key}": ${message}`);
    }
    private withTimeout<T>(operation: Promise<T>, timeoutMs = this.operationTimeout): Promise<T> {
        let timer: ReturnType<typeof setTimeout>;
        const timeout = new Promise<T>((_, reject) => {
            timer = setTimeout(() => {
                reject(new Error('Redis operation timed out'));
            }, timeoutMs);
        });

        return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
    }
}
