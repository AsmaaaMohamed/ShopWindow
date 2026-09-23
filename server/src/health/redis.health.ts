// src/health/redis.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redis: RedisService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const pong = await this.redis.ping();
      if (pong !== 'PONG') {
        throw new Error('Unexpected ping response');
      }
      return indicator.up();
    } catch (error) {
        console.log(error);
      return indicator.down({ message: 'Connection failed' });
    }
  }
}