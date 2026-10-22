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

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const storedToken =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isLoggedIn = isAuthenticated || Boolean(token) || Boolean(storedToken);

  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);

  const initialLikeCount = post._count?.likes ?? post.likeCount ?? 0;
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const commentCount = post._count?.comments ?? post.commentCount ?? 0;
  const [isSaved, setIsSaved] = useState(post.isSavedByMe || false);

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
    mutationFn: () =>
      isLiked ? postsApi.unlikePost(post.id) : postsApi.likePost(post.id),
    onMutate: () => {
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    },
    onError: () => {
      setIsLiked(isLiked);
      setLikeCount(post._count?.likes ?? post.likeCount ?? 0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore-feed'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      isSaved ? postsApi.unsavePost(post.id) : postsApi.savePost(post.id),
    onMutate: () => {
      setIsSaved(!isSaved);
    },
    onError: () => {
      setIsSaved(isSaved);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'saved'] });
    },
  });

  const handleLikeClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    likeMutation.mutate();
  };

  const handleSaveClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className='flex flex-col rounded-lg text-neutral-25 overflow-hidden gap-2 w-full max-w-150'>
      <div className='flex items-center gap-2 lg:gap-3'>
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className='h-11 w-11'>
            <AvatarImage src={post.author.avatarUrl} />
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
              onClick={handleLikeClick}
              className='focus:outline-none transition-transform active:scale-95'
            >
              <Heart
                className={`h-6 w-6 ${isLiked ? 'fill-accent-red text-accent-red' : 'text-neutral-25'}`}
              />
            </button>
            <span className='text-sm lg:text-md font-semibold'>
              {likeCount}
            </span>
          </div>

          <Link
            href={`/posts/${post.id}`}
            className='flex items-center gap-1.5'
          >
            <MessageCircle className='h-6 w-6' />
            <span className='text-sm font-semibold'>{commentCount}</span>
          </Link>
        </div>

        <button
          onClick={handleSaveClick}
          className='focus:outline-none transition-transform active:scale-95'
        >
          <Bookmark
            className={`h-6 w-6 text-neutral-25 ${isSaved ? 'fill-neutral-25' : 'fill-none'}`}
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
  );
}
