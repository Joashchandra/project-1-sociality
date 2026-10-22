'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';

export default function AuthHydration() {
  const dispatch = useDispatch();

  useEffect(() => {
    const localUser = localStorage.getItem('auth_user');
    const localToken = localStorage.getItem('auth_token');

    if (localToken && localUser) {
      try {
        const parsedUser = JSON.parse(localUser);
        dispatch(setUser(parsedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, [dispatch]);

  return null;
}
