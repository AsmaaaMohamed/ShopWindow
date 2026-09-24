import { Injectable } from "@nestjs/common";
import { ListProductsQueryDto } from "./dto/list-products-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { ProductStatus } from "../generated/prisma/enums";

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}
    /** 
     * Get Products
    */
   public async getProducts(query: ListProductsQueryDto) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const where = {
            status: {
                        not: ProductStatus.ARCHIVED,
                    },
        };
        const [products, count] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.product.count({
                where,
            }),
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