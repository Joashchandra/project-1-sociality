'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/services/post';

interface UseCreatePostOptions {
  onSuccessPost?: () => void;
  onShowAlert: (alert: { type: 'success' | 'error'; message: string }) => void;
  onClose: () => void;
}

export function useCreatePostMutation({
  onSuccessPost,
  onShowAlert,
  onClose,
}: UseCreatePostOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      selectedFile,
      caption,
    }: {
      selectedFile: File | null;
      caption: string;
    }) => {
      if (!selectedFile) throw new Error('Please upload an image.');
      if (!caption.trim()) throw new Error('Caption is required.');
      return postsApi.createPost({
        image: selectedFile,
        caption: caption.trim(),
      });
    },
    onSuccess: () => {
      onShowAlert({
        type: 'success',
        message: 'Success Post',
      });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'posts'] });

      onClose();
      onSuccessPost?.();
    },
    onError: (error: Error) => {
      onShowAlert({
        type: 'error',
        message: error.message || 'Failed to share post. Please try again.',
      });
    },
  });
}

export function useUpdateProfileMutation({
  onShowAlert,
  onClose,
}: {
  onShowAlert: (alert: { type: 'success' | 'error'; message: string }) => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      avatarFile,
      avatarPreview,
    }: {
      data: { name: string; username: string; phone: string; bio?: string };
      avatarFile: File | null;
      avatarPreview: string | null;
    }) => {
      const meApiModule = await import('@/services/me');
      return meApiModule.meApi.updateProfile({
        name: data.name.trim(),
        username: data.username.trim(),
        phone: data.phone.trim(),
        bio: data.bio?.trim(),
        avatar: avatarFile || undefined,
        avatarUrl: avatarPreview ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
      onShowAlert({
        type: 'success',
        message: 'Profile Success Update',
      });
      onClose();
    },
    onError: (error: Error) => {
      onShowAlert({
        type: 'error',
        message: error.message || 'Failed to update profile. Please try again.',
      });
    },
  });
}
