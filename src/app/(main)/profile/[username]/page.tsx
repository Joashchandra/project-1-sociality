'use client';

import { useState, use, useEffect, useRef } from 'react';
import { Post } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LayoutGrid, Heart, Send, Check, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/shared/Alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  useUserProfile,
  useUserPosts,
  useUserLikes,
  useFollowMutation,
} from '@/hooks/useUserProfile';
import { EditProfileModal } from '@/components/shared/EditProfile';
import { useMyProfile } from '@/hooks/useMe';
import PostCard from '@/components/shared/PostCard';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'gallery' | 'liked'>('gallery');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const postRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const { isLoggedIn, isMounted } = useCurrentUser();

  const { profileData, counts } = useUserProfile(username);

  const { profileData: myProfileData } = useMyProfile();
  const { data: userPostsData, isLoading: isLoadingPosts } = useUserPosts(
    username,
    { page: 1, limit: 20 },
    activeTab === 'gallery'
  );
  const { data: userLikesData, isLoading: isLoadingLikes } = useUserLikes(
    username,
    { page: 1, limit: 20 },
    activeTab === 'liked'
  );

  const followMutation = useFollowMutation(username);

  const handleShowAlert = (alert: {
    type: 'success' | 'error';
    message: string;
  }) => {
    setAlertState(alert);
    setTimeout(() => {
      setAlertState(null);
    }, 4000);
  };

  const postsList: Post[] =
    userPostsData?.data?.posts ?? userPostsData?.data?.items ?? [];
  const likedList: Post[] =
    userLikesData?.data?.posts ?? userLikesData?.data?.items ?? [];

  const currentList: Post[] = activeTab === 'gallery' ? postsList : likedList;
  const isLoading = activeTab === 'gallery' ? isLoadingPosts : isLoadingLikes;

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

  const isSelf = profileData?.isMe;
  const isFollowing = profileData?.isFollowing ?? false;

  const handleFollowClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    followMutation.mutate(isFollowing, {
      onError: (error) => {
        handleShowAlert({
          type: 'error',
          message: error.message || 'Failed to update follow status.',
        });
      },
    });
  };

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
        {selectedPostId === null && (
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
                  <p className='text-sm lg:text-md font-normal text-neutral-400'>
                    {profileData?.username ?? username}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 lg:gap-3'>
                {isSelf ? (
                  <button
                    type='button'
                    onClick={() => setIsEditModalOpen(true)}
                    className='flex w-full justify-center items-center h-10 border border-neutral-900 rounded-[100px] py-2 px-4 gap-2 text-sm font-bold hover:bg-neutral-800 transition lg:h-12 lg:max-w-32.5 cursor-pointer text-neutral-25'
                  >
                    Edit Profile
                  </button>
                ) : isFollowing ? (
                  <button
                    type='button'
                    onClick={handleFollowClick}
                    disabled={followMutation.isPending}
                    className='flex w-full items-center justify-center h-10 px-6 gap-2 border border-neutral-800 rounded-full text-sm font-bold hover:bg-neutral-900 transition cursor-pointer text-neutral-25 lg:h-12 lg:max-w-38'
                  >
                    <Check className='w-4 h-4 text-neutral-25' />
                    Following
                  </button>
                ) : (
                  <button
                    type='button'
                    onClick={handleFollowClick}
                    disabled={followMutation.isPending}
                    className='flex w-full items-center justify-center h-10 px-6 gap-2 rounded-full bg-primary-300 hover:bg-primary-200 text-sm font-bold transition cursor-pointer text-neutral-25 lg:h-12 lg:max-w-32.5'
                  >
                    Follow
                  </button>
                )}

                <button
                  type='button'
                  className='flex items-center justify-center w-10 aspect-square rounded-[1665.83px] border-[0.83px] border-neutral-900 hover:bg-neutral-800 transition lg:w-12 lg:h-12 cursor-pointer'
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
                  {counts?.post ?? 0}
                </span>
                <span className='text-xs text-neutral-400 lg:text-md'>
                  Post
                </span>
              </div>
              <div className='flex flex-col border-l border-neutral-900'>
                <span className='text-lg font-bold lg:text-xl'>
                  {counts?.followers ?? 0}
                </span>
                <span className='text-xs text-neutral-400 lg:text-md'>
                  Followers
                </span>
              </div>
              <div className='flex flex-col border-l border-neutral-900'>
                <span className='text-lg font-bold lg:text-xl'>
                  {counts?.following ?? 0}
                </span>
                <span className='text-xs text-neutral-400 lg:text-md'>
                  Following
                </span>
              </div>
              <div className='flex flex-col border-l border-neutral-900'>
                <span className='text-lg font-bold lg:text-xl'>
                  {counts?.likes ?? 0}
                </span>
                <span className='text-xs text-neutral-400 lg:text-md'>
                  Likes
                </span>
              </div>
            </div>
          </div>
        )}

        <div className='flex flex-col w-full gap-6'>
          {selectedPostId === null && (
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
                  setActiveTab('liked');
                  setSelectedPostId(null);
                }}
                className={`flex items-center justify-center gap-2 flex-1 py-3 text-sm font-semibold border-b-2 transition lg:text-md cursor-pointer ${
                  activeTab === 'liked'
                    ? 'border-neutral-25 text-neutral-25'
                    : 'border-transparent text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <Heart className='h-4 w-4 lg:h-5 lg:w-5' />
                Liked
              </button>
            </div>
          )}

          {selectedPostId !== null ? (
            <div className='flex flex-col items-center w-full gap-6 pb-12 relative'>
              <div className='sticky top-14 lg:top-16 z-30 flex items-center w-full bg-neutral-950/90 backdrop-blur-md py-3 px-4 border-b border-neutral-900'>
                <button
                  type='button'
                  onClick={() => setSelectedPostId(null)}
                  className='flex items-center gap-2 text-sm font-bold text-neutral-25 hover:underline transition cursor-pointer lg:text-md'
                >
                  <ArrowLeft className='h-5 w-5' />
                  <span>Posts</span>
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
                      ? 'No posts yet'
                      : 'No liked posts'}
                  </h2>
                  <p className='text-sm text-neutral-400 lg:text-md'>
                    {activeTab === 'gallery'
                      ? 'This user has not uploaded any posts yet.'
                      : 'Posts liked by this user will appear here.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={myProfileData}
        onShowAlert={handleShowAlert}
      />
    </>
  );
}
