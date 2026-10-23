'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, Loader2, CircleCheck } from 'lucide-react';
import {
  usePostLikes,
  useToggleFollowUserMutation,
} from '@/hooks/usePostLikes';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface LikesModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
  onShowAlert?: (alert: { type: 'success' | 'error'; message: string }) => void;
}

export function LikesModal({
  postId,
  isOpen,
  onClose,
  onShowAlert,
}: LikesModalProps) {
  const { user: currentUser, isLoggedIn } = useCurrentUser();
  const { data: likesResponse, isLoading } = usePostLikes(postId, isOpen);
  const toggleFollowMutation = useToggleFollowUserMutation(postId);

  const [followOverrides, setFollowOverrides] = useState<
    Record<string | number, boolean>
  >({});

  const likersList: User[] =
    likesResponse?.data?.users ?? likesResponse?.data?.items ?? [];

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

  if (!isOpen) return null;

  const handleToggleFollow = (
    targetUser: User,
    currentFollowStatus: boolean
  ) => {
    if (!isLoggedIn) {
      onShowAlert?.({
        type: 'error',
        message: 'Please log in to follow users.',
      });
      return;
    }

    const username = targetUser.username;
    if (!username) {
      onShowAlert?.({
        type: 'error',
        message: 'Invalid user target.',
      });
      return;
    }

    const targetKey = targetUser.id || targetUser.username;
    const nextStatus = !currentFollowStatus;

    setFollowOverrides((prev) => ({
      ...prev,
      [targetKey]: nextStatus,
    }));

    toggleFollowMutation.mutate(
      { username, isFollowing: currentFollowStatus },
      {
        onError: (err: Error) => {
          // Revert back on error
          setFollowOverrides((prev) => ({
            ...prev,
            [targetKey]: currentFollowStatus,
          }));

          onShowAlert?.({
            type: 'error',
            message: err.message || 'Failed to update follow status.',
          });
        },
      }
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex lg:flex-col items-end lg:items-center justify-center text-neutral-25 bg-black/80 backdrop-blur-sm'>
      <div className='flex flex-col w-full gap-2 lg:max-w-120 xl:max-w-137 md:mx-6'>
        <div className='flex flex-col w-full px-4 gap-2 items-end md:p-none'>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center bg-none text-neutral-25 cursor-pointer'
            aria-label='Close comments'
          >
            <X className='h-4 w-4 lg:h-6 lg:w-6' />
          </button>
        </div>
        <div className='relative flex flex-col w-full h-[60vh] p-4 pb-32 gap-3 rounded-t-2xl sm:rounded-2xl bg-neutral-950 lg:border border-neutral-900 animate-in slide-in-from-bottom lg:slide-in-from-bottom-0 lg:fade-in zoom-in-95 duration-150 overflow-hidden lg:p-5 lg:gap-3'>
          <div className='flex items-center'>
            <h2 className='text-md font-bold lg:text-xl'>Likes</h2>
          </div>

          <div className='flex flex-col gap-5 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
            {isLoading ? (
              <div className='space-y-4 py-2'>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className='flex items-center justify-between animate-pulse'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 rounded-full bg-neutral-900' />
                      <div className='space-y-2'>
                        <div className='h-3 w-28 bg-neutral-900 rounded' />
                        <div className='h-3 w-20 bg-neutral-900 rounded' />
                      </div>
                    </div>
                    <div className='h-9 w-28 bg-neutral-900 rounded-full' />
                  </div>
                ))}
              </div>
            ) : likersList.length > 0 ? (
              likersList.map((liker) => {
                const isSelf =
                  currentUser?.id === liker.id ||
                  (Boolean(currentUser?.username) &&
                    currentUser?.username === liker.username);

                const targetKey = liker.id || liker.username;
                const serverFollowStatus = liker.isFollowing ?? false;

                const isFollowing =
                  followOverrides[targetKey] ?? serverFollowStatus;

                const isPending =
                  toggleFollowMutation.isPending &&
                  toggleFollowMutation.variables?.username === liker.username;

                return (
                  <div
                    key={liker.id}
                    className='flex items-center justify-between gap-2'
                  >
                    <Link
                      href={`/profile/${liker.username}`}
                      className='flex w-full items-center gap-2 p-2 rounded-xl hover:bg-neutral-900/50 transition'
                    >
                      <Avatar className='h-12 w-12 border border-neutral-900 shrink-0'>
                        <AvatarImage src={liker.avatarUrl ?? undefined} />
                        <AvatarFallback className='bg-neutral-800 text-xs font-bold'>
                          {liker.name?.[0] ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex flex-col'>
                        <span className='text-sm font-bold'>{liker.name}</span>
                        <span className='text-xs text-neutral-400'>
                          {liker.username}
                        </span>
                      </div>
                    </Link>

                    {!isSelf && (
                      <button
                        type='button'
                        onClick={() => handleToggleFollow(liker, isFollowing)}
                        disabled={isPending}
                        className={`flex h-10 items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition cursor-pointer ${
                          isFollowing
                            ? 'border border-neutral-800 hover:bg-neutral-900'
                            : 'bg-primary-300 hover:bg-primary-200'
                        } ${isPending ? 'opacity-70' : ''}`}
                      >
                        {isPending ? (
                          <Loader2 className='w-4 h-4 animate-spin text-neutral-25' />
                        ) : isFollowing ? (
                          <>
                            <div>
                              <CircleCheck className='w-5 h-5' />
                            </div>
                            <span>Following</span>
                          </>
                        ) : (
                          <span>Follow</span>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className='flex h-full flex-col items-center justify-center text-center py-12'>
                <h4 className='text-sm font-bold text-neutral-25 mb-1'>
                  No likes yet
                </h4>
                <p className='text-xs text-neutral-400'>
                  Be the first to like this post!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
