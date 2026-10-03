import { createHash } from 'crypto';
import {
  normalizeListProductsQuery,
  serializeListQuery,
} from './query-normalizer.js';
import { ListProductsQueryDto } from '../products/dto/list-products-query.dto.js';

export function hashListQuery(query: Partial<ListProductsQueryDto>): string {
  const canonical = serializeListQuery(normalizeListProductsQuery(query));
  return createHash('sha256').update(canonical).digest('hex').slice(0, 32);
}