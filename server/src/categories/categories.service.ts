import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}
    public findAll() {
        return this.prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });
    }
}