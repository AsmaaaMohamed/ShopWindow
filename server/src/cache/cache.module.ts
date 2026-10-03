import { Global, Module } from "@nestjs/common";
import { RedisCacheAdapter } from "./redis-cache.adapter.js";
import { RedisModule } from "../redis/redis.module.js";

@Global()
@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: "CACHE_SERVICE",
            useClass: RedisCacheAdapter,
        },
    ],
    exports: ["CACHE_SERVICE"],
})
export class CacheModule {}
