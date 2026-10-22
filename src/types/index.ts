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
  avatarUrl?: string | null;
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

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  avatar?: File;
  avatarUrl?: string;
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
  caption: string | null; // Fixed: Can be null from backend
  imageUrl: string;
  createdAt: string;
  likedAt?: string;
  author: User;
  likedByMe?: boolean;
  isLikedByMe?: boolean; // Fixed: Added for PostCard compatibility
  isSavedByMe?: boolean;
  likeCount?: number;
  commentCount?: number;
  _count?: {
    likes?: number;
    comments?: number;
  };
}

export interface CreatePostPayload {
  image: File;
  caption?: string;
}

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: User;
  postId: number;
}

export interface CreateCommentPayload {
  text: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchUsersParams extends PaginationParams {
  q: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Fixed: Flexible paginated wrapper to match dynamic API response keys (posts, users, items)
export interface PaginatedResponse<T> {
  success?: boolean;
  message?: string;
  data: {
    posts?: T[];
    users?: T[];
    items?: T[];
    pagination?: PaginationMeta;
  };
}
