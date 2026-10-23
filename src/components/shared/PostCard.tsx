'use client';

import { useState, useRef, useEffect } from 'react';
import { Post } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  post: Post;
  onShowAlert?: (alert: { type: 'success' | 'error'; message: string }) => void;
}

export default function PostCard({ post, onShowAlert }: PostCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

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

  const { data: myLikesData } = useMyLikes({ page: 1, limit: 20 }, isLoggedIn);
  const { data: mySavedData } = useMySaved({ page: 1, limit: 20 }, isLoggedIn);

  const likesList = myLikesData?.data?.posts;
  const isLiked = Array.isArray(likesList)
    ? likesList.some((likedPost: Post) => likedPost.id === post.id)
    : (post.isLikedByMe ?? post.likedByMe ?? false);

  const savedList = mySavedData?.data?.posts;
  const isSaved = Array.isArray(savedList)
    ? savedList.some((savedPost: Post) => savedPost.id === post.id)
    : (post.isSavedByMe ?? false);

  const likeCount = post._count?.likes ?? post.likeCount ?? 0;
  const commentCount = post._count?.comments ?? post.commentCount ?? 0;

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
  }, [isExpanded, post.caption]);

  const likeMutation = useMutation({
    mutationFn: (currentlyLiked: boolean) =>
      currentlyLiked
        ? postsApi.unlikePost(post.id)
        : postsApi.likePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['explore-feed-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'likes'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (currentlySaved: boolean) =>
      currentlySaved
        ? postsApi.unsavePost(post.id)
        : postsApi.savePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'saved'] });
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

  return (
    <>
      <div className='flex flex-col rounded-lg text-neutral-25 overflow-hidden gap-2 w-full max-w-150'>
        <div className='flex items-center gap-2 lg:gap-3'>
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className='h-11 w-11'>
              <AvatarImage src={post.author.avatarUrl ?? undefined} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className='text-sm font-bold text-neutral-25 hover:underline'
            >
              {post.author.name}
            </Link>
            <p className='text-xs text-neutral-400'>
              {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>

        <div className='relative aspect-square w-full'>
          <Image
            src={post.imageUrl}
            alt='Post image'
            fill
            unoptimized
            className='rounded-md object-cover'
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
            onClick={handleSaveClick}
            className='focus:outline-none transition-transform active:scale-95'
          >
            <Bookmark
              className={`h-6 w-6 text-neutral-25 ${
                isSaved ? 'fill-neutral-25' : 'fill-none'
              }`}
            />
          </button>
        </div>

        {post.caption && (
          <div className='text-sm lg:text-md flex flex-col'>
            <Link
              href={`/profile/${post.author.username}`}
              className='font-bold hover:underline w-fit'
            >
              {post.author.username}
            </Link>
            <p
              ref={textRef}
              className={`text-neutral-25 ${!isExpanded ? 'line-clamp-2' : ''}`}
            >
              {post.caption}
            </p>
            {(isOverflowing || isExpanded) && (
              <button
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
        post={post}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onShowAlert={onShowAlert}
      />

      <LikesModal
        postId={post.id}
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        onShowAlert={onShowAlert}
      />
    </>
  );
}
