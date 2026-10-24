'use client';

import { useState, useRef, useEffect } from 'react';
import { Post } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Bookmark, MessageCircle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { postsApi } from '@/services/post';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMyLikes, useMySaved } from '@/hooks/useMe';
import { CommentModal } from './CommentModal';
import { LikesModal } from './LikesModal';

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

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressStartTimeRef = useRef<number>(0);
  const didTriggerHoldRef = useRef(false);

  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const storedToken =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isLoggedIn = isAuthenticated || Boolean(token) || Boolean(storedToken);

  const { data: postDetailResponse, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post-detail', targetPostId],
    queryFn: () => postsApi.getPostDetail(targetPostId),
    enabled: Boolean(targetPostId),
    initialData: propPost ? (propPost as unknown as Post) : undefined,
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

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

  const likeMutation = useMutation({
    mutationFn: (currentlyLiked: boolean) =>
      currentlyLiked
        ? postsApi.unlikePost(targetPostId)
        : postsApi.likePost(targetPostId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post-detail', targetPostId],
      });
      queryClient.invalidateQueries({ queryKey: ['feed-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['explore-feed-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'likes'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (currentlySaved: boolean) =>
      currentlySaved
        ? postsApi.unsavePost(targetPostId)
        : postsApi.savePost(targetPostId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post-detail', targetPostId],
      });
      queryClient.invalidateQueries({ queryKey: ['me', 'saved'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'posts'] });
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
