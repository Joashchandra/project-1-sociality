'use client';

import { useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meApi } from '@/services/me';
import { MeApiResponse, MeStats, Post, User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LayoutGrid, Bookmark, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const subscribe = () => () => {};
const getLocalStorageToken = () => localStorage.getItem('auth_token');
const getServerToken = () => null;

const emptySubscribe = () => () => {};
const getClientTrue = () => true;
const getServerFalse = () => false;

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'gallery' | 'saved'>('gallery');

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientTrue,
    getServerFalse
  );

  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const storedToken = useSyncExternalStore(
    subscribe,
    getLocalStorageToken,
    getServerToken
  );

  const isLoggedIn = isAuthenticated || Boolean(token) || Boolean(storedToken);

  const { data: meResponse } = useQuery<MeApiResponse | User>({
    queryKey: ['me', 'profile'],
    queryFn: meApi.getProfile,
    enabled: isLoggedIn && isMounted,
  });

  const profileData: User | undefined =
    'data' in (meResponse || {})
      ? (meResponse as MeApiResponse)?.data?.profile
      : (meResponse as User);

  const statsData: MeStats | undefined =
    'data' in (meResponse || {})
      ? (meResponse as MeApiResponse)?.data?.stats
      : undefined;

  const { data: myPostsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['me', 'posts'],
    queryFn: () => meApi.getMyPosts({ page: 1, limit: 20 }),
    enabled: isLoggedIn && isMounted && activeTab === 'gallery',
  });

  const { data: mySavedData, isLoading: isLoadingSaved } = useQuery({
    queryKey: ['me', 'saved'],
    queryFn: () => meApi.getMySaved({ page: 1, limit: 20 }),
    enabled: isLoggedIn && isMounted && activeTab === 'saved',
  });

  if (!isMounted) {
    return (
      <div className='flex flex-col pt-4 gap-4 items-center w-full text-neutral-25'>
        <div className='w-full h-40 bg-neutral-900 animate-pulse rounded-sm' />
      </div>
    );
  }

  const postsList: Post[] =
    myPostsData?.data?.posts ?? myPostsData?.data?.items ?? [];
  const savedList: Post[] =
    mySavedData?.data?.posts ?? mySavedData?.data?.items ?? [];

  const currentList: Post[] = activeTab === 'gallery' ? postsList : savedList;
  const isLoading = activeTab === 'gallery' ? isLoadingPosts : isLoadingSaved;

  return (
    <div className='flex flex-col pt-4 gap-4 items-center w-full text-neutral-25 lg:max-w-203'>
      <div className='flex flex-col w-full gap-4'>
        <div className='flex flex-col gap-3 justify-between w-full lg:flex-row'>
          <div className='flex items-center gap-3 lg:gap-5'>
            <Avatar className='h-16 w-16 border border-neutral-900'>
              <AvatarImage src={profileData?.avatarUrl ?? undefined} />
              <AvatarFallback className='text-xl font-bold bg-neutral-800 text-neutral-25'>
                {profileData?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <h1 className='text-sm lg:text-md font-bold'>
                {profileData?.name ?? 'User'}
              </h1>
              <p className='text-sm lg:text-md font-normal'>
                {profileData?.username ?? 'username'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 lg:gap-3'>
            <Link
              href='/edit-profile'
              className='flex w-full justify-center items-center h-10 border border-neutral-900 rounded-[100px] py-2 px-4 gap-2 text-sm font-bold hover:bg-neutral-800 transition lg:h-12 lg:max-w-32.5'
            >
              Edit Profile
            </Link>
            <button
              className='flex items-center justify-center w-10 aspect-square rounded-[1665.83px] border-[0.83px] border-neutral-900 hover:bg-neutral-800 transition lg:w-12 lg:h-12'
              aria-label='Share Profile'
            >
              <Send className='h-4 w-4 lg:h-5 lg:w-5' />
            </button>
          </div>
        </div>

        {profileData?.bio && (
          <p className='text-sm lg:text-md'>{profileData.bio}</p>
        )}

        <div className='grid grid-cols-4 w-full text-center'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-lg font-bold lg:text-xl'>
              {statsData?.posts ?? profileData?._count?.posts ?? 0}
            </span>
            <span className='text-xs text-neutral-400 lg:text-md'>Post</span>
          </div>
          <div className='flex flex-col border-l border-neutral-900'>
            <span className='text-lg font-bold lg:text-xl'>
              {statsData?.followers ?? profileData?._count?.followers ?? 0}
            </span>
            <span className='text-xs text-neutral-400 lg:text-md'>
              Followers
            </span>
          </div>
          <div className='flex flex-col border-l border-neutral-900'>
            <span className='text-lg font-bold lg:text-xl'>
              {statsData?.following ?? profileData?._count?.following ?? 0}
            </span>
            <span className='text-xs text-neutral-400 lg:text-md'>
              Following
            </span>
          </div>
          <div className='flex flex-col border-l border-neutral-900'>
            <span className='text-lg font-bold lg:text-xl'>
              {statsData?.likes ?? profileData?._count?.likes ?? 0}
            </span>
            <span className='text-xs text-neutral-400 lg:text-md'>Likes</span>
          </div>
        </div>
      </div>

      <div className='flex flex-col w-full gap-6'>
        <div className='flex border-b border-neutral-900 w-full'>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center justify-center h-12 gap-2 flex-1 py-3 text-sm font-bold border-b-2 transition lg:text-md ${
              activeTab === 'gallery'
                ? 'border-neutral-25 text-neutral-25'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            <LayoutGrid className='h-4 w-4 lg:h-5 lg:w-5' />
            Gallery
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-semibold border-b-2 transition lg:text-md ${
              activeTab === 'saved'
                ? 'border-neutral-25 text-neutral-25'
                : 'border-transparent text-neutral-500 hover:text-neutral-400'
            }`}
          >
            <Bookmark className='h-4 w-4 lg:h-5 lg:w-5' />
            Saved
          </button>
        </div>

        {isLoading ? (
          <div className='grid grid-cols-3 gap-1 md:gap-2 w-full'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className='aspect-square bg-neutral-900 animate-pulse rounded-sm'
              />
            ))}
          </div>
        ) : currentList.length > 0 ? (
          <div className='grid grid-cols-3 gap-1 md:gap-2 w-full'>
            {currentList.map((post: Post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className='relative aspect-square w-full overflow-hidden group bg-neutral-900 rounded-sm'
              >
                <Image
                  src={post.imageUrl}
                  alt={post.caption || 'Post image'}
                  fill
                  unoptimized
                  className='object-cover transition-transform duration-300 group-hover:scale-105'
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center text-center w-full py-16 lg:py-38.5'>
            <div className='flex flex-col items-center max-w-113.25 w-full gap-3 lg:gap-6'>
              <div className='flex flex-col gap-1'>
                <h2 className='text-md font-bold lg:text-lg'>
                  {activeTab === 'gallery'
                    ? 'Your story starts here'
                    : 'Save your favorite moments'}
                </h2>
                <p className='text-sm text-neutral-400 lg:text-md'>
                  {activeTab === 'gallery'
                    ? 'Share your first post and let the world see your moments, passions, and memories. Make this space truly yours.'
                    : 'You haven’t saved any posts yet. Posts you save will appear here.'}
                </p>
              </div>
              {activeTab === 'gallery' && (
                <button
                  onClick={() => router.push('/create')}
                  className='flex items-center justify-center w-full max-w-64.75 h-10 rounded-full bg-primary-300 hover:bg-primary-200 font-bold text-sm transition lg:h-12 lgtext-md'
                >
                  Upload My First Post
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
