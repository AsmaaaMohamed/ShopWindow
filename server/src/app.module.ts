import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
    imports: [HealthModule,RedisModule,PrismaModule,ProductsModule,CategoriesModule],
})
export class AppModule {}
