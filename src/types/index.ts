export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterApiResponse {
  success?: boolean;
  message?: string;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  isFollowedByMe?: boolean;
  isMe?: boolean;
  followsMe?: boolean;
  _count?: {
    posts?: number;
    followers?: number;
    following?: number;
    likes?: number;
    saved?: number;
  };
}

export interface UserSearchResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Post {
  id: number;
  caption: string;
  imageUrl: string;
  createdAt: string;
  author: User;
  isLikedByMe?: boolean;
  isSavedByMe?: boolean;
  _count?: {
    likes?: number;
    comments?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchUsersParams extends PaginationParams {
  q: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
