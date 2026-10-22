import { api } from '@/lib/axios';
import {
  Post,
  CreatePostPayload,
  PaginationParams,
  PaginatedResponse,
  User,
  CreateCommentPayload,
  Comment,
} from '@/types';

export const postsApi = {
  getExplorePosts: async (params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Post>>('/posts', { params });
    return res.data;
  },
  createPost: async (payload: CreatePostPayload) => {
    const formData = new FormData();
    formData.append('image', payload.image);
    if (payload.caption) formData.append('caption', payload.caption);

    const res = await api.post<Post>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getPostDetail: async (id: number) => {
    const res = await api.get<Post>(`/posts/${id}`);
    return res.data;
  },
  deletePost: async (id: number) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
  likePost: async (id: number) => {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  },
  unlikePost: async (id: number) => {
    const res = await api.delete(`/posts/${id}/like`);
    return res.data;
  },
  getPostLikes: async (id: number, params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<User>>(`/posts/${id}/likes`, {
      params,
    });
    return res.data;
  },
  savePost: async (id: number) => {
    const res = await api.post(`/posts/${id}/save`);
    return res.data;
  },
  unsavePost: async (id: number) => {
    const res = await api.delete(`/posts/${id}/save`);
    return res.data;
  },
  getComments: async (postId: number, params?: PaginationParams) => {
    const res = await api.get<PaginatedResponse<Comment>>(
      `/posts/${postId}/comments`,
      { params }
    );
    return res.data;
  },
  addComment: async (postId: number, payload: CreateCommentPayload) => {
    const res = await api.post<Comment>(`/posts/${postId}/comments`, payload);
    return res.data;
  },
  deleteComment: async (commentId: number) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};
