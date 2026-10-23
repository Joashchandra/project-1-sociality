import { useQuery } from '@tanstack/react-query';
import { meApi } from '@/services/me';
import { MeApiResponse, PaginationParams, User } from '@/types';
import { useCurrentUser } from './useCurrentUser';

export const meKeys = {
  all: ['me'] as const,
  profile: () => ['me', 'profile'] as const,
  posts: (params?: PaginationParams) => ['me', 'posts', params] as const,
  likes: (params?: PaginationParams) => ['me', 'likes', params] as const,
  saved: (params?: PaginationParams) => ['me', 'saved', params] as const,
};

export function useMyProfile() {
  const { isLoggedIn, isMounted } = useCurrentUser();

  const {
    data: meResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<MeApiResponse | User>({
    queryKey: meKeys.profile(),
    queryFn: meApi.getProfile,
    enabled: isLoggedIn && isMounted,
  });

  const profileData: User | undefined =
    meResponse && 'data' in meResponse
      ? (meResponse as MeApiResponse).data?.profile
      : (meResponse as User);

  const statsData =
    meResponse && 'data' in meResponse
      ? (meResponse as MeApiResponse).data?.stats
      : undefined;

  return {
    profileData,
    statsData,
    isLoading,
    isError,
    refetch,
  };
}

export function useMyPosts(
  params: PaginationParams = { page: 1, limit: 20 },
  enabledOverride?: boolean
) {
  const { isLoggedIn, isMounted } = useCurrentUser();
  const isEnabled = enabledOverride ?? (isLoggedIn && isMounted);

  return useQuery({
    queryKey: meKeys.posts(params),
    queryFn: () => meApi.getMyPosts(params),
    enabled: isEnabled,
  });
}

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
  enabledOverride?: boolean
) {
  const { isLoggedIn, isMounted } = useCurrentUser();
  const isEnabled = enabledOverride ?? (isLoggedIn && isMounted);

  return useQuery({
    queryKey: meKeys.saved(params),
    queryFn: () => meApi.getMySaved(params),
    enabled: isEnabled,
  });
}
