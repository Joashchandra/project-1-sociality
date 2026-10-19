import { api } from '@/lib/axios';
import { LoginPayload, RegisterPayload, AuthResponse } from '@/types';

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },
  login: async (payload: LoginPayload) => {
    const res = await api.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },
};
