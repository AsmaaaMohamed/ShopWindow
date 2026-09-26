import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsGreaterThanOrEqualTo } from '../validators/price-range.validator';
 
export enum ProductSort {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

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

   // Category slug, e.g. ?category=electronics
  @IsOptional()
  @IsString({ message: 'category must be a string' })
  category?: string;
 
  // Free-text search over product name and description.
  @IsOptional()
  @IsString({ message: 'q must be a string' })
  q?: string;
 
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minPrice must be a number' })
  @Min(0, { message: 'minPrice cannot be negative' })
  minPrice?: number;
 
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'maxPrice must be a number' })
  @Min(0, { message: 'maxPrice cannot be negative' })
  @IsGreaterThanOrEqualTo('minPrice', {
    message: 'maxPrice must be greater than or equal to minPrice',
  })
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ProductSort, {
    message: 'sort must be a valid sorting option',
  })
  sort?: ProductSort;
}