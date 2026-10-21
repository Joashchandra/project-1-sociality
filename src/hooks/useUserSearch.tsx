import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/users';

export function useUserSearch(searchQuery: string, limit = 5) {
  return useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: () => usersApi.searchUsers({ q: searchQuery, limit }),
    enabled: searchQuery.trim().length > 1,
  });
}
