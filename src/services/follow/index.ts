import { api } from '@/lib/axios';

export const followApi = {
  followUser: async (username: string) => {
    const res = await api.post(`/follow/${username}`);
    return res.data;
  },
  unfollowUser: async (username: string) => {
    const res = await api.delete(`/follow/${username}`);
    return res.data;
  },
};
