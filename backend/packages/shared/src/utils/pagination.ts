import type { PaginatedMeta } from '../types/api-response.js';

export function paginate(page: number, perPage: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * perPage,
    take: perPage,
  };
}

export function buildPaginatedMeta(total: number, page: number, perPage: number): PaginatedMeta {
  const totalPages = Math.ceil(total / perPage);
  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}
