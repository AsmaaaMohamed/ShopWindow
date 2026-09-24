import { Injectable } from "@nestjs/common";
import { ListProductsQueryDto } from "./dto/list-products-query.dto";
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
        const { page, limit, category, q, minPrice, maxPrice } = query;
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
                orderBy: { createdAt: 'desc'},
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

}