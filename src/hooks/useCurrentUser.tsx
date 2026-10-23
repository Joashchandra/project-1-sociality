'use client';

import { useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { meApi } from '@/services/me';
import { MeApiResponse, User } from '@/types';
import { RootState } from '@/store';

const subscribe = () => () => {};
const getLocalStorageToken = () => localStorage.getItem('auth_token');
const getServerToken = () => null;

const emptySubscribe = () => () => {};
const getClientTrue = () => true;
const getServerFalse = () => false;

export function useCurrentUser() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientTrue,
    getServerFalse
  );

  const {
    user: reduxUser,
    isAuthenticated,
    token,
  } = useSelector((state: RootState) => state.auth);

  const storedToken = useSyncExternalStore(
    subscribe,
    getLocalStorageToken,
    getServerToken
  );

  const isLoggedIn = isAuthenticated || Boolean(token) || Boolean(storedToken);

  const {
    data: meResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<MeApiResponse | User>({
    queryKey: ['me', 'profile'],
    queryFn: meApi.getProfile,
    enabled: isLoggedIn && isMounted,
  });

  const user: User | undefined =
    meResponse && 'data' in meResponse
      ? meResponse.data?.profile
      : (meResponse as User) || reduxUser;

  return {
    user,
    isLoggedIn,
    isMounted,
    isLoading,
    isError,
    refetch,
  };
}
