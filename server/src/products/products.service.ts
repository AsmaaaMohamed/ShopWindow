import { Injectable, NotFoundException } from "@nestjs/common";
import { ListProductsQueryDto, ProductSort } from "./dto/list-products-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { ProductStatus } from "../generated/prisma/enums";
import { Prisma } from "../generated/prisma/browser";

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}
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
       const where = {
           ...(isId ? { id: idOrSlug } : { slug: idOrSlug }),
           status: ProductStatus.ACTIVE,
       };
       const product = await this.prisma.product.findUnique({where});
       if (!product) {
           throw new NotFoundException('Product not found');
       }
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