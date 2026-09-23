import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [HealthModule,RedisModule,PrismaModule],
})
export class AppModule {}
