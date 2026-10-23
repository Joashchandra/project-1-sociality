'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/services/post';
import { followApi } from '@/services/follow';
import { PaginationParams } from '@/types';

export function usePostLikes(
  postId: number,
  isOpen: boolean,
  params: PaginationParams = { page: 1, limit: 50 }
) {
  return useQuery({
    queryKey: ['post-likes', postId, params],
    queryFn: () => postsApi.getPostLikes(postId, params),
    enabled: Boolean(postId) && isOpen,
  });
}

export function useToggleFollowUserMutation(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      isFollowing,
    }: {
      username: string;
      isFollowing: boolean;
    }) => {
      return isFollowing
        ? followApi.unfollowUser(username)
        : followApi.followUser(username);
    },
    onSuccess: (_, { username }) => {
      queryClient.invalidateQueries({ queryKey: ['post-likes', postId] });
      queryClient.invalidateQueries({
        queryKey: ['users', username, 'profile'],
      });
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['feed-infinite'] });
    },
  });
}
