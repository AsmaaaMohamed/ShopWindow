import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
 
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
 
export class ListProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page: number = 1;
 
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(MAX_PAGE_SIZE, { message: `limit cannot exceed ${MAX_PAGE_SIZE}` })
  limit: number = DEFAULT_PAGE_SIZE;
}