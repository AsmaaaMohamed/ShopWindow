import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ListProductsQueryDto } from "./dto/list-products-query.dto";

@Controller("products")
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
    @Get()
    public async getProducts(@Query() query: ListProductsQueryDto) {
        return this.productsService.getProducts(query);
    }

    @Get(':idOrSlug')
    public async getProductByIdOrSlug(@Param('idOrSlug') idOrSlug: string) {
        return this.productsService.getProductByIdOrSlug(idOrSlug);
    }
}