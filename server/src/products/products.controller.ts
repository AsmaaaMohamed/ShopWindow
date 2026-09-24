import { Controller, Get, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ListProductsQueryDto } from "./dto/list-products-query.dto";

@Controller("products")
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
    @Get()
    async getProducts(@Query() query: ListProductsQueryDto) {
        return this.productsService.getProducts(query);
    }
}