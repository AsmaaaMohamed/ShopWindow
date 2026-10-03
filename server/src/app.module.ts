import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { RedisModule } from './redis/redis.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './products/products.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CacheModule } from './cache/cache.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
    imports: [HealthModule,RedisModule,PrismaModule,ProductsModule,CategoriesModule, CacheModule, AuthModule],
})
export class AppModule {}
