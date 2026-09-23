// src/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    super({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 200, 2000), // يحاول تاني كل ما فشل، مع تأخير متزايد لحد 2 ثانية
      maxRetriesPerRequest: 1, // منع الأوامر (زي ping) من الانتظار طويل قبل ما ترجع error
    });

    this.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleInit() {
    try {
      await this.connect();
    } catch (err) {
        console.log(err);
      this.logger.warn('Redis not available at startup');
    }
  }

  onModuleDestroy() {
    this.disconnect();
  }
}