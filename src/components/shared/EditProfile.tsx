'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { meApi } from '@/services/me';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EditProfileInput, editProfileSchema } from '@/validations/schema';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: User;
  onShowAlert: (alert: { type: 'success' | 'error'; message: string }) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onShowAlert,
}: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser?.avatarUrl || null
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || '',
      avatarUrl: currentUser?.avatarUrl || undefined,
    },
  });

  const [prevUser, setPrevUser] = useState(currentUser);
  if (currentUser !== prevUser) {
    setPrevUser(currentUser);
    reset({
      name: currentUser?.name || '',
      username: currentUser?.username || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || '',
      avatarUrl: currentUser?.avatarUrl || undefined,
    });
    setAvatarPreview(currentUser?.avatarUrl || null);
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        onShowAlert({
          type: 'error',
          message: 'Avatar image must be under 5MB.',
        });
        return;
      }
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setValue('avatarUrl', previewUrl);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileInput) => {
      return meApi.updateProfile({
        name: data.name.trim(),
        username: data.username.trim(),
        phone: data.phone.trim(),
        bio: data.bio?.trim(),
        avatar: avatarFile || undefined,
        avatarUrl: avatarPreview ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
      onShowAlert({
        type: 'success',
        message: 'Profile Success Update',
      });
      onClose();
    },
    onError: (error: Error) => {
      onShowAlert({
        type: 'error',
        message: error.message || 'Failed to update profile. Please try again.',
      });
    },
  });

  const onSubmit = (data: EditProfileInput) => {
    updateProfileMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black mt-[64px] py-4 overflow-y-auto lg:mt-20'>
      <div className='flex flex-col max-w-90.25 w-full gap-4 lg:gap-6 lg:max-w-200 rounded-2xl text-neutral-25 relative my-auto'>
        <div className='flex items-center gap-2 w-full lg:gap-3'>
          <button
            type='button'
            onClick={onClose}
            className='flex flex-col items-center justify-center w-6 h-6 rounded-full hover:bg-neutral-800 transition lg:w-8 lg:h-8 cursor-pointer'
            aria-label='Close'
          >
            <ArrowLeft className='w-5 h-5 lg:w-7 lg:h-7' />
          </button>
          <h1 className='text-md font-bold lg:text-display-xs'>Edit Profile</h1>
        </div>

        <div className='flex flex-col w-full gap-4 lg:flex-row lg:gap-12'>
          <div className='flex flex-col items-center gap-4'>
            <Avatar className='h-20 w-20 border-2 border-neutral-800 lg:w-32.5 lg:h-32.5'>
              <AvatarImage
                src={avatarPreview ?? undefined}
                className='object-cover'
              />
              <AvatarFallback className='text-2xl font-bold bg-neutral-800 text-neutral-25'>
                {currentUser?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='flex items-center justify-center w-40 h-10 lg:h-12 px-4 py-2 rounded-full border border-neutral-900 text-sm lg:text-md font-bold hover:bg-neutral-800 transition cursor-pointer'
            >
              Change Photo
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/png, image/jpeg, image/jpg'
              className='hidden'
              onChange={handleAvatarChange}
            />
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col w-full gap-4 lg:gap-6'
          >
            <div className='flex flex-col gap-0.5 w-full'>
              <label className='text-sm font-bold'>Name</label>
              <Input
                {...register('name')}
                error={Boolean(errors.name)}
                placeholder='Your Name'
              />
              {errors.name && (
                <span className='text-sm font-medium text-accent-red'>
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className='flex flex-col gap-0.5 w-full'>
              <label className='text-sm font-bold'>Username</label>
              <Input
                {...register('username')}
                error={Boolean(errors.username)}
                placeholder='username'
              />
              {errors.username && (
                <span className='text-sm font-medium text-accent-red'>
                  {errors.username.message}
                </span>
              )}
            </div>

            <div className='flex flex-col gap-0.5 w-full'>
              <label className='text-sm font-bold'>Email</label>
              <Input
                type='email'
                {...register('email')}
                error={Boolean(errors.email)}
                placeholder='email@example.com'
              />
              {errors.email && (
                <span className='text-sm font-medium text-accent-red'>
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className='flex flex-col gap-0.5 w-full'>
              <label className='text-sm font-bold'>Number Phone</label>
              <Input
                {...register('phone')}
                error={Boolean(errors.phone)}
                placeholder='081234567890'
              />
              {errors.phone && (
                <span className='text-sm font-medium text-accent-red'>
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className='flex flex-col gap-0.5 w-full'>
              <label className='text-sm font-bold'>Bio</label>
              <Textarea
                {...register('bio')}
                error={Boolean(errors.bio)}
                placeholder='Create your bio'
                rows={3}
              />
              {errors.bio && (
                <span className='text-sm font-medium text-accent-red'>
                  {errors.bio.message}
                </span>
              )}
            </div>

            <button
              type='submit'
              disabled={updateProfileMutation.isPending}
              className='flex w-full items-center justify-center h-10 gap-2 p-2 rounded-full bg-primary-300 hover:bg-primary-200 disabled:opacity-50 text-sm font-bold transition cursor-pointer lg:h-12'
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
