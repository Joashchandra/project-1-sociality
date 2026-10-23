'use client';

import { useEffect, useRef } from 'react';
import PostCard from '@/components/shared/PostCard';
import { useInfinitePosts } from '@/hooks/useInfinitePosts';
import Divider from '@/components/shared/Divider';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function FeedPage() {
  const { isLoggedIn, isMounted } = useCurrentUser();

  const {
    posts,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useInfinitePosts(isLoggedIn);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!isMounted || isLoading) {
    return (
      <div className='flex flex-col items-center justify-center w-full gap-4 text-neutral-400'>
        <div className='flex w-full max-w-150 h-screen bg-neutral-900 animate-pulse rounded-xl'></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='text-center py-12 text-accent-red font-medium'>
        Failed to load feed. Please try refreshing.
      </div>
    );
  }

  return (
    <div>
      <div className='flex flex-col gap-4'>
        {posts.map((post, index) => (
          <div key={`${post.id}-${index}`} className='flex flex-col gap-4'>
            {index < posts.length - 1 && <Divider />}
            <PostCard post={post} />
          </div>
        ))}
      </div>

      <div ref={loadMoreRef} className='py-4 text-center'>
        {isFetchingNextPage && (
          <span className='text-sm text-gray-400'>Loading more feed</span>
        )}
        {!hasNextPage && posts.length > 0 && (
          <span className='text-xs text-gray-500'>There is no more feed</span>
        )}
      </div>
    </div>
  );
}
