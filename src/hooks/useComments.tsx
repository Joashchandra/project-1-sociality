'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCommentPayload, PaginationParams } from '@/types';
import { postsApi } from '@/services/post';

export const commentKeys = {
  all: ['comments'] as const,
  postComments: (postId: number, params?: PaginationParams) =>
    ['comments', 'post', postId, params] as const,
};

export function usePostComments(
  postId: number,
  isOpen: boolean,
  params: PaginationParams = { page: 1, limit: 50 }
) {
  return useQuery({
    queryKey: commentKeys.postComments(postId, params),
    queryFn: () => postsApi.getComments(postId, params),
    enabled: Boolean(postId) && isOpen,
  });
}

export function useAddCommentMutation(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      postsApi.addComment(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', 'post', postId],
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed-infinite'] });
    },
  });
}

export function useDeleteCommentMutation(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => postsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', 'post', postId],
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed-infinite'] });
    },
  });
}
