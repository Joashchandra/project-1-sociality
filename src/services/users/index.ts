import { api } from '@/lib/axios';
import {
  User,
  Post,
  SearchUsersParams,
  PaginationParams,
  PaginatedResponse,
  UserSearchResponse,
  PublicProfileResponse,
} from '@/types';

export const usersApi = {
  searchUsers: async (params: SearchUsersParams) => {
    const res = await api.get<{ data: UserSearchResponse }>('/users/search', {
      params,
    });
    return res.data.data;
  },
  getPublicProfile: async (username: string) => {
    const res = await api.get<PublicProfileResponse>(`/users/${username}`);
    return res.data;
  },
  getUserPosts: async (username: string, params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Post>>(
      `/users/${username}/posts`,
      { params }
    );
    return res.data;
  },
  getUserLikes: async (username: string, params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Post>>(
      `/users/${username}/likes`,
      { params }
    );
    return res.data;
  },
  getUserFollowers: async (username: string, params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<User>>(
      `/users/${username}/followers`,
      { params }
    );
    return res.data;
  },
  getUserFollowing: async (username: string, params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<User>>(
      `/users/${username}/following`,
      { params }
    );
    return res.data;
  },
};
