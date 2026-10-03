import { DEFAULT_PAGE_SIZE, ListProductsQueryDto, ProductSort } from "../products/dto/list-products-query.dto.js";
import { CacheKeys } from "./cache-keys.js";
import { hashListQuery } from "./list-query-hash.js";

export interface NormalizedListProductsQuery {
  page: number;
  limit: number;
  sort: ProductSort;
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

export function normalizeListProductsQuery(
  query: Partial<ListProductsQueryDto>,
): NormalizedListProductsQuery {
  const normalized: NormalizedListProductsQuery = {
    page: query.page ?? 1,
    limit: query.limit ?? DEFAULT_PAGE_SIZE,
    sort: query.sort ?? ProductSort.NEWEST,
  };

  // Keep the exact values used by the database query so distinct queries
  // cannot accidentally share a cache entry.
  if (query.category !== undefined) normalized.category = query.category;
  if (query.q !== undefined) normalized.q = query.q;
  if (typeof query.minPrice === 'number') normalized.minPrice = query.minPrice;
  if (typeof query.maxPrice === 'number') normalized.maxPrice = query.maxPrice;

  return normalized;
}

export function serializeListQuery(query: NormalizedListProductsQuery): string {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}


export function buildProductListCacheKey(
  query: Partial<ListProductsQueryDto>,
): string {
  return CacheKeys.list(hashListQuery(query));
}
