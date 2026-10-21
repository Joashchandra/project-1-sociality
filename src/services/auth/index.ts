import { api } from '@/lib/axios';
import {
  LoginApiResponse,
  LoginPayload,
  RegisterApiResponse,
  RegisterPayload,
} from '@/types';

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const res = await api.post<RegisterApiResponse>('/auth/register', payload);
    return res.data;
  },
  login: async (payload: LoginPayload) => {
    const res = await api.post<LoginApiResponse>('/auth/login', payload);
    return res.data;
  },
};
