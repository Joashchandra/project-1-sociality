import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '@/services/feed';
import { postsApi } from '@/services/post';
import { Post } from '@/types';

export function useInfinitePosts(isLoggedIn: boolean) {
  const feedQuery = useInfiniteQuery({
    queryKey: ['feed-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      feedApi.getFeed({ page: pageParam as number, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
    enabled: isLoggedIn,
  });

  const feedPosts: Post[] =
    feedQuery.data?.pages.flatMap((pageData) => {
      const responseData = pageData?.data as { items?: Post[]; posts?: Post[] };
      return responseData?.items || responseData?.posts || [];
    }) || [];

  const feedHasEnded =
    isLoggedIn && !feedQuery.hasNextPage && !feedQuery.isLoading;

  const exploreQuery = useInfiniteQuery({
    queryKey: ['explore-feed-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      postsApi.getExplorePosts({ page: pageParam as number, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
    enabled: !isLoggedIn || feedHasEnded,
  });

  const explorePosts: Post[] =
    exploreQuery.data?.pages.flatMap((pageData) => {
      const responseData = pageData?.data as { items?: Post[]; posts?: Post[] };
      return responseData?.items || responseData?.posts || [];
    }) || [];

  const combinedPostsMap = new Map<number, Post>();
  feedPosts.forEach((post) => combinedPostsMap.set(post.id, post));
  explorePosts.forEach((post) => {
    if (!combinedPostsMap.has(post.id)) {
      combinedPostsMap.set(post.id, post);
    }
  });

  const posts = Array.from(combinedPostsMap.values());

  const activeQuery = feedHasEnded
    ? exploreQuery
    : isLoggedIn
      ? feedQuery
      : exploreQuery;

  return {
    ...activeQuery,
    posts,
    isShowingExplore: !isLoggedIn || feedHasEnded,
  };
}
