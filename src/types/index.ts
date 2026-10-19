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

export interface AuthResponse {
  token: string;
  user: User;
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
