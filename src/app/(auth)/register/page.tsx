'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { registerSchema, RegisterInput } from '@/validations/schema';
import Logo from '@/components/shared/Logo';
import { Eye, EyeOff } from 'lucide-react';
import { Alert } from '@/components/shared/Alert';
import axios from 'axios';
import { RegisterApiResponse } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response: RegisterApiResponse) => {
      if (response?.success === false) {
        throw new Error(response?.message || 'Registration failed');
      }
      router.push('/login');
    },
  });

  const onSubmit = (data: RegisterInput) => {
    const payload = {
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password,
    };

    mutation.mutate(payload);
  };

  return (
    <div className='flex flex-col items-center w-full lg:max-w-130.75 bg-black/20 border border-neutral-900 rounded-[16px] gap-4 lg:gap-6 text-neutral-25 py-8 px-4'>
      <Logo />

      <h1 className='text-display-xs font-bold text-center'>Register</h1>

      {mutation.isError && (
        <Alert
          type='error'
          message={
            axios.isAxiosError(mutation.error)
              ? mutation.error.response?.data?.message
              : (mutation.error as Error)?.message ||
                'Registration failed. Please check your details and try again.'
          }
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full flex flex-col gap-5'
      >
        <div className='flex flex-col gap-0.5'>
          <label className='text-sm font-bold text-neutral-white'>Name</label>
          <Input
            placeholder='Enter your name'
            error={!!errors.name}
            {...register('name')}
          />
          {errors.name && (
            <p className='text-sm text-accent-red'>{errors.name.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-0.5'>
          <label className='text-sm font-bold text-neutral-white'>
            Username
          </label>
          <Input
            placeholder='Enter your username'
            error={!!errors.username}
            {...register('username')}
          />
          {errors.username && (
            <p className='text-sm text-accent-red'>{errors.username.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-0.5'>
          <label className='text-sm font-bold text-neutral-white'>Email</label>
          <Input
            type='email'
            placeholder='Enter your email'
            error={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className='text-sm text-accent-red'>{errors.email.message}</p>
          )}
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-bold text-neutral-white'>
            Number Phone
          </label>
          <Input
            placeholder='Enter your number phone'
            error={!!errors.phone}
            {...register('phone')}
          />
          {errors.phone && (
            <p className='text-sm text-accent-red'>{errors.phone.message}</p>
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

        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-bold text-neutral-white'>
            Confirm Password
          </label>
          <div className='relative'>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Enter your confirm password'
              error={!!errors.confirmPassword}
              className='pr-10'
              {...register('confirmPassword')}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors'
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className='text-sm text-accent-red'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-4'>
          <Button
            type='submit'
            className='w-full h-11 mt-2 bg-primary-300 hover:bg-primary-200 text-md font-bold text-neutral-25 rounded-[100px] transition-all'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>

          <p className='text-md text-neutral-25 font-semibold text-center'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-primary-200 font-bold hover:underline'
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
