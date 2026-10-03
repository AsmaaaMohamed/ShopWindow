import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ListProductsQueryDto, ProductSort } from "./dto/list-products-query.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProductStatus } from "../generated/prisma/enums.js";
import { Prisma } from "../generated/prisma/browser.js";
import type { CachePort } from "../cache/cache.port.js";
import type{ Product } from '../generated/prisma/client.js';
import { CacheKeys } from "../cache/cache-keys.js";

@Injectable()
export class ProductsService {
    private readonly PRODUCT_DETAIL_TTL_SECONDS = 600;
    constructor(
        private prisma: PrismaService,
        @Inject("CACHE_SERVICE") private readonly cache: CachePort) {}
    /** 
     * Get Products
    */
   public async getProducts(query: ListProductsQueryDto) {
        const { page, limit, category, q, minPrice, maxPrice , sort} = query;
        const orderBy = query.sort
            ? this.getOrderBy(sort)
            : [
                { createdAt: 'desc' as const },
                { id: 'asc' as const },
            ];
        const skip = (page - 1) * limit;
        const where: Prisma.ProductWhereInput = {
            status: ProductStatus.ACTIVE,
        };
        if (category) {
            where.category = { slug: category };
        }
    
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
        }
    
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            };
        }
        const [products, count] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: { category: true },
            }),
            this.prisma.product.count({where}),
        ]);
        const totalPages = count === 0 ? 0 : Math.ceil(count / limit);
        return {
            daa:products,
            meta:{
                page,
                limit,
                count,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        };
   }
   public async getProductByIdOrSlug(idOrSlug: string) {
                
        const isId = this.isValidUuid(idOrSlug);
        const cacheKey = isId
            ? CacheKeys.product(idOrSlug)
            : CacheKeys.productSlug(idOrSlug);
        // 1) check the cache first
        const cached = await this.cache.get<Product>(cacheKey);
        if (cached) {
            console.log('cache hit' , cached);
            return cached; // cache hit: Prisma مش بيتنادى خالص
        }
        console.log('cache miss' ,cached);
        // 2) cache miss -> PostgreSQL
       const where = {
           ...(isId ? { id: idOrSlug } : { slug: idOrSlug }),
           status: ProductStatus.ACTIVE,
       };
       const product = await this.prisma.product.findUnique({where});
       if (!product) {
           throw new NotFoundException('Product not found');
       }
           // 3) خزّنه للمرة الجاية
        await this.cache.set(cacheKey, product, this.PRODUCT_DETAIL_TTL_SECONDS);
        console.log('POSTGRES PRODUCT:', product);
        return product;
   }
   private getOrderBy(sort?: ProductSort) {
        switch (sort) {
            case ProductSort.PRICE_ASC:
                return [
                    { price: 'asc' as const },
                    { createdAt: 'desc' as const },
                ];

            case ProductSort.PRICE_DESC:
                return [
                    { price: 'desc' as const },
                    { createdAt: 'desc' as const },
                ];

            case ProductSort.NEWEST:
                return [
                    { createdAt: 'desc' as const },
                    { id: 'asc' as const },
                ];

            case ProductSort.OLDEST:
                return [
                    { createdAt: 'asc' as const },
                    { id: 'asc' as const },
                ];

            default:
                return [
                    { createdAt: 'desc' as const },
                    { id: 'asc' as const },
                ];
        }
    }
    private isValidUuid(value: string): boolean {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
        );
    }

}