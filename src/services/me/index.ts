import { api } from '@/lib/axios';
import {
  User,
  UpdateProfilePayload,
  Post,
  PaginationParams,
  PaginatedResponse,
} from '@/types';

export const meApi = {
  getProfile: async () => {
    const res = await api.get<User>('/me');
    return res.data;
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    const formData = new FormData();
    if (payload.name) formData.append('name', payload.name);
    if (payload.username) formData.append('username', payload.username);
    if (payload.phone) formData.append('phone', payload.phone);
    if (payload.bio) formData.append('bio', payload.bio);
    if (payload.avatar) formData.append('avatar', payload.avatar);
    if (payload.avatarUrl) formData.append('avatarUrl', payload.avatarUrl);

    const res = await api.patch<User>('/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getMyPosts: async (params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Post>>('/me/posts', { params });
    return res.data;
  },
  getMyLikes: async (params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Post>>('/me/likes', { params });
    return res.data;
  },
  getMySaved: async (params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Post>>('/me/saved', { params });
    return res.data;
  },
  getMyFollowers: async (params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<User>>('/me/followers', {
      params,
    });
    return res.data;
  },
  getMyFollowing: async (params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<User>>('/me/following', {
      params,
    });
    return res.data;
  },
};
