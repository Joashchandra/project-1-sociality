'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/users';
import { followApi } from '@/services/follow';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PaginationParams } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  profile: (username: string) => ['users', username, 'profile'] as const,
  posts: (username: string, params?: PaginationParams) =>
    ['users', username, 'posts', params] as const,
  likes: (username: string, params?: PaginationParams) =>
    ['users', username, 'likes', params] as const,
};

export function useUserProfile(username: string) {
  const { isMounted } = useCurrentUser();

  const query = useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => usersApi.getPublicProfile(username),
    enabled: Boolean(username) && isMounted,
  });

  const profileResponse = query.data;
  const profileData = profileResponse?.data;
  const counts = profileData?.counts;

  return {
    ...query,
    profileData,
    counts,
  };
}

export function useUserPosts(
  username: string,
  params: PaginationParams = { page: 1, limit: 20 },
  enabledOverride?: boolean
) {
  const { isMounted } = useCurrentUser();
  const isEnabled = enabledOverride ?? (Boolean(username) && isMounted);

  return useQuery({
    queryKey: userKeys.posts(username, params),
    queryFn: () => usersApi.getUserPosts(username, params),
    enabled: isEnabled,
  });
}

export function useUserLikes(
  username: string,
  params: PaginationParams = { page: 1, limit: 20 },
  enabledOverride?: boolean
) {
  const { isMounted } = useCurrentUser();
  const isEnabled = enabledOverride ?? (Boolean(username) && isMounted);

  return useQuery({
    queryKey: userKeys.likes(username, params),
    queryFn: () => usersApi.getUserLikes(username, params),
    enabled: isEnabled,
  });
}

export function useFollowMutation(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isCurrentlyFollowing: boolean) =>
      isCurrentlyFollowing
        ? followApi.unfollowUser(username)
        : followApi.followUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile(username) });
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
    },
  });
}
