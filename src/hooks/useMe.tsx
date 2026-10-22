import { useQuery } from '@tanstack/react-query';
import { meApi } from '@/services/me';
import { PaginationParams } from '@/types';

export const meKeys = {
  all: ['me'] as const,
  likes: (params?: PaginationParams) => ['me', 'likes', params] as const,
  saved: (params?: PaginationParams) => ['me', 'saved', params] as const,
};

export function useMyLikes(
  params: PaginationParams = { page: 1, limit: 20 },
  enabled = true
) {
  return useQuery({
    queryKey: meKeys.likes(params),
    queryFn: () => meApi.getMyLikes(params),
    enabled,
  });
}

export function useMySaved(
  params: PaginationParams = { page: 1, limit: 20 },
  enabled = true
) {
  return useQuery({
    queryKey: meKeys.saved(params),
    queryFn: () => meApi.getMySaved(params),
    enabled,
  });
}
