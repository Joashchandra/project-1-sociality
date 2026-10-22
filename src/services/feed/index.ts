import { api } from '@/lib/axios';
import { Post, PaginationParams, PaginatedResponse } from '@/types';

export const feedApi = {
  getFeed: async (params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Post>>('/feed', { params });
    return res.data;
  },
};
