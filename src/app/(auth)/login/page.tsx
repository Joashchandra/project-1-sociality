'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/auth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { loginSchema, LoginInput } from '@/validations/schema';
import Logo from '@/components/shared/Logo';
import { Alert } from '@/components/shared/Alert';
import { Eye, EyeOff } from 'lucide-react';
import { LoginApiResponse } from '@/types';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response: LoginApiResponse) => {
      const token = response?.data?.token;
      const user = response?.data?.user;
      console.log(token);
      console.log(user);
      if (!token || !user) {
        throw new Error(response?.message || 'Invalid response structure');
      }

      dispatch(setCredentials({ user, token }));
      router.push('/feed');
    },
  });

  const onSubmit = (data: LoginInput) => {
    mutation.mutate(data);
  };

  return (
    <div className='flex flex-col items-center w-full lg:max-w-130.75 bg-black/20 border border-neutral-900 rounded-[16px] gap-4 lg:gap-6 text-neutral-25 py-8 px-4'>
      <Logo />

      <h1 className='text-display-xs font-bold text-center'>Welcome Back!</h1>

      {mutation.isError && (
        <Alert
          type='error'
          message={
            axios.isAxiosError(mutation.error)
              ? mutation.error.response?.data?.message
              : (mutation.error as Error)?.message || 'Invalid credentials'
          }
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full flex flex-col gap-5'
      >
        <div className='flex flex-col gap-0.5'>
          <label className='text-sm font-bold text-neutral-white'>Email</label>
          <Input
            type='email'
            placeholder='Enter your email'
            autoComplete='off'
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className='text-sm text-accent-red'>{errors.email.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-bold text-neutral-white'>
            Password
          </label>
          <div className='relative'>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter your password'
              autoComplete='off'
              error={!!errors.password}
              className='pr-10'
              {...register('password')}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors'
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className='text-sm text-accent-red'>{errors.password.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-4'>
          <Button
            type='submit'
            className='w-full h-11 mt-2 bg-primary-300 hover:bg-primary-200 text-md font-bold text-neutral-25 rounded-[100px] transition-all'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Logging in...' : 'Login'}
          </Button>

          <p className='text-md text-neutral-25 font-semibold text-center'>
            {"Don't have an account? "}
            <Link
              href='/register'
              className='text-primary-200 font-bold hover:underline'
            >
              Register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
