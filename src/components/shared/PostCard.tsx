'use client';

import { useState, useRef, useEffect } from 'react';
import { Post } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Heart,
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Loader2,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { postsApi } from '@/services/post';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMyLikes, useMySaved, useMyProfile } from '@/hooks/useMe';
import { CommentModal } from './CommentModal';
import { LikesModal } from './LikesModal';
import { Button } from '@/components/ui/button';

dayjs.extend(relativeTime);

interface PostCardProps {
  postId?: number;
  post?: Post;
  onShowAlert?: (alert: { type: 'success' | 'error'; message: string }) => void;
}

export default function PostCard({
  postId: propPostId,
  post: propPost,
  onShowAlert,
}: PostCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const targetPostId = propPostId ?? propPost?.id ?? 0;

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTimeRef = useRef<number>(0);
  const didTriggerHoldRef = useRef(false);

  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const storedToken =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isLoggedIn = isAuthenticated || Boolean(token) || Boolean(storedToken);

  const { profileData: myProfile } = useMyProfile();

  const { data: postDetailResponse, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post-detail', targetPostId],
    queryFn: () => postsApi.getPostDetail(targetPostId),
    enabled: Boolean(targetPostId),
    placeholderData: propPost ? (propPost as unknown as Post) : undefined,
  });

  const rawPost =
    (postDetailResponse as unknown as { data?: Post })?.data ??
    (postDetailResponse as Post) ??
    propPost;

  const { data: myLikesData } = useMyLikes({ page: 1, limit: 20 }, isLoggedIn);
  const { data: mySavedData } = useMySaved({ page: 1, limit: 20 }, isLoggedIn);

  const likesList = myLikesData?.data?.posts;
  const isLiked = Array.isArray(likesList)
    ? likesList.some((likedPost: Post) => likedPost?.id === targetPostId)
    : (rawPost?.isLikedByMe ?? rawPost?.likedByMe ?? false);

  const savedList = mySavedData?.data?.posts;
  const isSaved = Array.isArray(savedList)
    ? savedList.some((savedPost: Post) => savedPost?.id === targetPostId)
    : (rawPost?.isSavedByMe ?? false);

  const likeCount = rawPost?._count?.likes ?? rawPost?.likeCount ?? 0;
  const commentCount = rawPost?._count?.comments ?? rawPost?.commentCount ?? 0;

  const author = rawPost?.author ??
    (rawPost as unknown as { user?: Post['author'] })?.user ?? {
      id: 0,
      username: 'user',
      name: 'User',
      avatarUrl: null,
    };

  // Check if logged-in user is the post author
  const isOwner =
    Boolean(myProfile?.id && author?.id && myProfile.id === author.id) ||
    Boolean(
      myProfile?.username &&
      author?.username &&
      myProfile.username === author.username
    );

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const checkOverflow = () => {
      const el = textRef.current;
      if (el && !isExpanded) {
        setIsOverflowing(el.scrollHeight > el.clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [isExpanded, rawPost?.caption]);

  const invalidateAllPostQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['post-detail', targetPostId] });
    queryClient.invalidateQueries({ queryKey: ['feed-infinite'] });
    queryClient.invalidateQueries({ queryKey: ['explore-feed-infinite'] });
    queryClient.invalidateQueries({ queryKey: ['me', 'likes'] });
    queryClient.invalidateQueries({ queryKey: ['me', 'posts'] });
    queryClient.invalidateQueries({ queryKey: ['me', 'saved'] });
    queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const likeMutation = useMutation({
    mutationFn: (currentlyLiked: boolean) =>
      currentlyLiked
        ? postsApi.unlikePost(targetPostId)
        : postsApi.likePost(targetPostId),
    onSuccess: () => {
      invalidateAllPostQueries();
    },
  });

  const saveMutation = useMutation({
    mutationFn: (currentlySaved: boolean) =>
      currentlySaved
        ? postsApi.unsavePost(targetPostId)
        : postsApi.savePost(targetPostId),
    onSuccess: () => {
      invalidateAllPostQueries();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deletePost(targetPostId),
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      invalidateAllPostQueries();
      onShowAlert?.({
        type: 'success',
        message: 'Post deleted successfully.',
      });
    },
    onError: (err: Error) => {
      onShowAlert?.({
        type: 'error',
        message: err.message || 'Failed to delete post.',
      });
    },
  });

  const handleHoldStart = () => {
    didTriggerHoldRef.current = false;
    pressStartTimeRef.current = Date.now();

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    holdTimerRef.current = setTimeout(() => {
      didTriggerHoldRef.current = true;
      setIsLikesModalOpen(true);
    }, 500);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const duration = Date.now() - pressStartTimeRef.current;
    if (didTriggerHoldRef.current || duration >= 500) {
      didTriggerHoldRef.current = false;
      return;
    }
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    likeMutation.mutate(isLiked);
  };

  const handleSaveClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    saveMutation.mutate(isSaved);
  };

  if (isLoadingPost && !rawPost) {
    return (
      <div className='flex flex-col rounded-lg text-neutral-25 overflow-hidden gap-2 w-full max-w-150 animate-pulse'>
        <div className='flex items-center gap-2 lg:gap-3'>
          <div className='h-11 w-11 rounded-full bg-neutral-900' />
          <div className='space-y-1.5'>
            <div className='h-3.5 w-28 bg-neutral-900 rounded' />
            <div className='h-3 w-16 bg-neutral-900 rounded' />
          </div>
        </div>
        <div className='aspect-square w-full bg-neutral-900 rounded-md' />
      </div>
    );
  }

  if (!rawPost) return null;

  return (
    <>
      <div className='flex flex-col rounded-lg text-neutral-25 overflow-hidden gap-2 w-full max-w-150'>
        <div className='flex items-center justify-between gap-2 lg:gap-3'>
          <div className='flex items-center gap-2 lg:gap-3'>
            <Link href={`/profile/${author.username}`}>
              <Avatar className='h-11 w-11'>
                <AvatarImage src={author.avatarUrl ?? undefined} />
                <AvatarFallback>{author.name?.[0] ?? 'U'}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                href={`/profile/${author.username}`}
                className='text-sm font-bold text-neutral-25 hover:underline'
              >
                {author.name}
              </Link>
              <p className='text-xs text-neutral-400'>
                {dayjs(rawPost.createdAt).fromNow()}
              </p>
            </div>
          </div>

          {/* Owner options menu */}
          {isOwner && (
            <div className='relative' ref={menuRef}>
              <button
                type='button'
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className='flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-25 hover:bg-neutral-900 transition cursor-pointer'
                aria-label='Post options'
              >
                <MoreHorizontal className='h-5 w-5' />
              </button>

              {isMenuOpen && (
                <div className='absolute right-0 top-10 z-10 w-40 rounded-xl bg-neutral-950 border border-neutral-800 p-1 shadow-lg animate-in fade-in zoom-in-95 duration-150'>
                  <button
                    type='button'
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsDeleteModalOpen(true);
                    }}
                    className='flex items-center gap-2.5 w-full px-3 py-2 text-sm font-bold text-accent-red hover:bg-neutral-800 rounded-lg transition cursor-pointer text-left'
                  >
                    <Trash2 className='h-4 w-4' />
                    Delete post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='relative aspect-square w-full bg-neutral-900 rounded-md overflow-hidden'>
          <Image
            src={rawPost.imageUrl}
            alt='Post image'
            fill
            unoptimized
            className='object-cover'
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 lg:gap-4'>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                onClick={handleLikeClick}
                className='focus:outline-none transition-transform active:scale-95 cursor-pointer'
                aria-label='Like post (Hold to view likes)'
              >
                <Heart
                  className={`h-6 w-6 ${
                    isLiked
                      ? 'fill-accent-red text-accent-red'
                      : 'text-neutral-25'
                  }`}
                />
              </button>
              <span className='text-sm lg:text-md font-semibold'>
                {likeCount}
              </span>
            </div>

            <button
              type='button'
              onClick={() => setIsCommentModalOpen(true)}
              className='flex items-center gap-1.5 focus:outline-none cursor-pointer'
              aria-label='Open comments'
            >
              <MessageCircle className='h-6 w-6 text-neutral-25' />
              <span className='text-sm font-semibold'>{commentCount}</span>
            </button>
          </div>

          <button
            type='button'
            onClick={handleSaveClick}
            className='focus:outline-none transition-transform active:scale-95 cursor-pointer'
            aria-label='Save post'
          >
            <Bookmark
              className={`h-6 w-6 text-neutral-25 ${
                isSaved ? 'fill-neutral-25' : 'fill-none'
              }`}
            />
          </button>
        </div>

        {rawPost.caption && (
          <div className='text-sm lg:text-md flex flex-col'>
            <Link
              href={`/profile/${author.username}`}
              className='font-bold hover:underline w-fit'
            >
              {author.username}
            </Link>
            <p
              ref={textRef}
              className={`text-neutral-25 ${!isExpanded ? 'line-clamp-2' : ''}`}
            >
              {rawPost.caption}
            </p>
            {(isOverflowing || isExpanded) && (
              <button
                type='button'
                onClick={() => setIsExpanded(!isExpanded)}
                className='font-bold text-primary-200 hover:brightness-125 text-left cursor-pointer'
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
          <div className='flex flex-col w-full max-w-80 rounded-2xl bg-neutral-950 border border-neutral-800 p-5 gap-4 text-center text-neutral-25 animate-in fade-in zoom-in-95 duration-150'>
            <div className='flex flex-col gap-1.5 text-center'>
              <h3 className='text-lg font-bold'>Delete Post?</h3>
              <p className='text-xs text-neutral-400'>
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
            </div>
            <div className='flex items-center gap-2 w-full'>
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => setIsDeleteModalOpen(false)}
                className='flex-1 h-9 rounded-full border border-neutral-700 text-xs font-bold hover:bg-neutral-800 transition cursor-pointer text-neutral-25'
              >
                Cancel
              </Button>
              <Button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                className='flex-1 h-9 rounded-full bg-red-600 hover:bg-red-700 text-xs font-bold text-neutral-25 transition cursor-pointer disabled:opacity-50'
              >
                {deleteMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CommentModal
        post={rawPost}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onShowAlert={onShowAlert}
      />

      <LikesModal
        postId={targetPostId}
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        onShowAlert={onShowAlert}
      />
    </>
  );
}
