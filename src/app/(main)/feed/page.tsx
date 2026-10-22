'use client';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import PostCard from '@/components/shared/PostCard';
import { useInfinitePosts } from '@/hooks/useInfinitePosts';
import Divider from '@/components/shared/Divider';

export default function FeedPage() {
  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const storedToken =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isLoggedIn = isAuthenticated || Boolean(token) || Boolean(storedToken);

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

  if (isLoading) return <div className='text-center py-8'>Loading feed...</div>;
  if (isError)
    return (
      <div className='text-center py-8 text-red-500'>Failed to load feed.</div>
    );

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
