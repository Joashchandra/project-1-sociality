'use client';

import { useState, useEffect, useRef } from 'react';
import { Post } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LayoutGrid, Bookmark, Send, LogOut, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '@/store/authSlice';
import { CreatePostModal } from '@/components/shared/CreatePost';
import { EditProfileModal } from '@/components/shared/EditProfile';
import PostCard from '@/components/shared/PostCard';
import { Alert } from '@/components/shared/Alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyPosts, useMyProfile, useMySaved } from '@/hooks/useMe';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'gallery' | 'saved'>('gallery');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const postRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { isMounted } = useCurrentUser();

  const { profileData, statsData } = useMyProfile();
  const { data: myPostsData, isLoading: isLoadingPosts } = useMyPosts(
    { page: 1, limit: 20 },
    activeTab === 'gallery'
  );
  const { data: mySavedData, isLoading: isLoadingSaved } = useMySaved(
    { page: 1, limit: 20 },
    activeTab === 'saved'
  );

  const handleShowAlert = (alert: {
    type: 'success' | 'error';
    message: string;
  }) => {
    setAlertState(alert);
    setTimeout(() => {
      setAlertState(null);
    }, 4000);
  };

  const executeLogout = () => {
    dispatch(logout());
    queryClient.clear();
    router.push('/login');
  };

  const postsList: Post[] =
    myPostsData?.data?.posts ?? myPostsData?.data?.items ?? [];
  const savedList: Post[] =
    mySavedData?.data?.posts ?? mySavedData?.data?.items ?? [];

  const currentList: Post[] = activeTab === 'gallery' ? postsList : savedList;
  const isLoading = activeTab === 'gallery' ? isLoadingPosts : isLoadingSaved;

  useEffect(() => {
    if (selectedPostId !== null && postRefs.current[selectedPostId]) {
      postRefs.current[selectedPostId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedPostId]);

  if (!isMounted) {
    return (
      <div className='flex flex-col pt-4 gap-4 items-center w-full text-neutral-25'>
        <div className='w-full h-40 bg-neutral-900 animate-pulse rounded-sm' />
      </div>
    );
  }

  return (
    <>
      {alertState && (
        <div className='fixed top-21.5 right-5 left-5 lg:left-auto lg:right-5 z-50 flex h-10 w-auto lg:top-28 lg:max-w-72.75 lg:w-full'>
          <Alert
            type={alertState.type}
            message={alertState.message}
            onClose={() => setAlertState(null)}
            className='w-full'
          />
        </div>
      )}

      <div className='flex flex-col pt-4 gap-4 items-center w-full text-neutral-25 lg:max-w-203'>
        <div className='flex flex-col w-full gap-4'>
          <div className='flex flex-col gap-3 justify-between w-full lg:flex-row'>
            <div className='flex items-center justify-between w-full lg:w-auto lg:justify-start gap-3 lg:gap-5'>
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
                  <p className='text-sm lg:text-md font-normal text-neutral-400'>
                    {profileData?.username ?? 'username'}
                  </p>
                </div>
              </div>

              <Button
                size='icon'
                onClick={() => setIsLogoutModalOpen(true)}
                className='flex lg:hidden items-center justify-center w-10 h-10 rounded-full border border-neutral-900 transition text-neutral-25 hover:text-accent-red hover:bg-neutral-800 cursor-pointer'
                aria-label='Logout'
              >
                <LogOut className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex items-center gap-2 lg:gap-3'>
              <button
                type='button'
                onClick={() => setIsEditModalOpen(true)}
                className='flex w-full justify-center items-center h-10 border border-neutral-900 rounded-[100px] py-2 px-4 gap-2 text-sm font-bold hover:bg-neutral-800 transition lg:h-12 lg:max-w-32.5 cursor-pointer text-neutral-25'
              >
                Edit Profile
              </button>
              <button
                type='button'
                className='flex items-center justify-center w-10 aspect-square rounded-[1665.83px] border-[0.83px] border-neutral-900 hover:bg-neutral-800 transition lg:w-12 lg:h-12 cursor-pointer'
                aria-label='Share Profile'
              >
                <Send className='h-4 w-4 lg:h-5 lg:w-5' />
              </button>

              <Button
                size='icon'
                onClick={() => setIsLogoutModalOpen(true)}
                className='hidden lg:flex items-center justify-center w-12 h-12 rounded-full border border-neutral-900 transition text-neutral-25 hover:text-accent-red hover:bg-neutral-800 cursor-pointer'
                aria-label='Logout'
              >
                <LogOut className='h-5 w-5' />
              </Button>
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
              onClick={() => {
                setActiveTab('gallery');
                setSelectedPostId(null);
              }}
              className={`flex items-center justify-center h-12 gap-2 flex-1 py-3 text-sm font-bold border-b-2 transition lg:text-md cursor-pointer ${
                activeTab === 'gallery'
                  ? 'border-neutral-25 text-neutral-25'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <LayoutGrid className='h-4 w-4 lg:h-5 lg:w-5' />
              Gallery
            </button>

            <button
              onClick={() => {
                setActiveTab('saved');
                setSelectedPostId(null);
              }}
              className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-semibold border-b-2 transition lg:text-md cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-neutral-25 text-neutral-25'
                  : 'border-transparent text-neutral-500 hover:text-neutral-400'
              }`}
            >
              <Bookmark className='h-4 w-4 lg:h-5 lg:w-5' />
              Saved
            </button>
          </div>

          {selectedPostId !== null ? (
            <div className='flex flex-col items-center w-full gap-6 pb-12'>
              <div className='sticky bg-black top-16 lg:top-20 z-30 flex items-center w-full py-3 px-4'>
                <button
                  type='button'
                  onClick={() => setSelectedPostId(null)}
                  className='flex items-center gap-2 text-sm font-bold text-neutral-25 hover:underline transition cursor-pointer lg:text-md'
                >
                  <ArrowLeft className='h-5 w-5' />
                  Posts
                </button>
              </div>

              <div className='flex flex-col items-center gap-8 w-full'>
                {currentList.map((post) => (
                  <div
                    key={post.id}
                    ref={(el) => {
                      postRefs.current[post.id] = el;
                    }}
                    className='w-full flex justify-center'
                  >
                    <PostCard post={post} onShowAlert={handleShowAlert} />
                  </div>
                ))}
              </div>
            </div>
          ) : isLoading ? (
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
                <button
                  type='button'
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className='relative aspect-square w-full overflow-hidden group bg-neutral-900 rounded-sm cursor-pointer'
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || 'Post image'}
                    fill
                    unoptimized
                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                </button>
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
                    onClick={() => setIsCreateModalOpen(true)}
                    className='flex items-center justify-center w-full max-w-64.75 h-10 rounded-full bg-primary-300 hover:bg-primary-200 font-bold text-sm transition lg:h-12 lg:text-md cursor-pointer'
                  >
                    Upload My First Post
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLogoutModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4'>
          <div className='flex flex-col w-full max-w-100 bg-[#111318] border border-neutral-800 rounded-2xl p-6 gap-5 text-neutral-25'>
            <div className='flex flex-col gap-2 text-center'>
              <h3 className='text-lg font-bold'>Log out of your account?</h3>
            </div>
            <div className='flex flex-col gap-2.5'>
              <Button
                onClick={executeLogout}
                className='w-full h-11 bg-red-600 hover:bg-red-700 font-bold rounded-xl transition cursor-pointer'
              >
                Log Out
              </Button>
              <Button
                onClick={() => setIsLogoutModalOpen(false)}
                className='w-full h-11 border-neutral-800 bg-transparent hover:bg-neutral-800 font-semibold rounded-xl transition cursor-pointer'
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onShowAlert={handleShowAlert}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={profileData}
        onShowAlert={handleShowAlert}
      />
    </>
  );
}
