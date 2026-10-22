import { useInfiniteQuery } from '@tanstack/react-query';
import { feedApi } from '@/services/feed';
import { postsApi } from '@/services/post';
import { Post } from '@/types';

export function useInfinitePosts(isLoggedIn: boolean) {
  const query = useInfiniteQuery({
    queryKey: isLoggedIn ? ['feed-infinite'] : ['explore-feed-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      isLoggedIn
        ? feedApi.getFeed({ page: pageParam, limit: 10 })
        : postsApi.getExplorePosts({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination) return undefined;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
  });

  const posts: Post[] =
    query.data?.pages.flatMap((pageData) => {
      const responseData = pageData?.data as { items?: Post[]; posts?: Post[] };
      console.log('pageData received:', pageData);
      return responseData?.items || responseData?.posts || [];
    }) || [];

  return {
    ...query,
    posts,
  };
}
