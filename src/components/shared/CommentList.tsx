'use client';

import { useState, useRef, useEffect } from 'react';
import { Comment, User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  currentUser?: User | null;
  onDeleteComment: (commentId: number) => void;
  isDeleting: boolean;
}

export function CommentList({
  comments,
  isLoading,
  currentUser,
  onDeleteComment,
  isDeleting,
}: CommentListProps) {
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousCommentsLength = useRef(comments.length);

  useEffect(() => {
    if (comments.length > previousCommentsLength.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }
    previousCommentsLength.current = comments.length;
  }, [comments.length]);

  const handleConfirmDelete = (commentId: number) => {
    onDeleteComment(commentId);
    setDeletingCommentId(null);
  };

  if (isLoading) {
    return (
      <div className='flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='flex gap-3 animate-pulse'>
            <div className='h-8 w-8 rounded-full bg-neutral-900' />
            <div className='flex-1 space-y-2'>
              <div className='h-3 w-1/3 bg-neutral-900 rounded' />
              <div className='h-3 w-3/4 bg-neutral-900 rounded' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center text-center p-4 py-12'>
        <h4 className='text-sm font-bold text-neutral-25'>No Comments yet</h4>
        <p className='text-xs text-neutral-400'>Start the conversation</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollRef}
        className='flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
      >
        {comments.map((comment) => {
          const author = comment.author ?? comment.user;
          const isCommentOwner =
            currentUser?.id === author?.id ||
            (Boolean(currentUser?.username) &&
              currentUser?.username === author?.username);

          return (
            <div
              key={comment.id}
              className='flex items-center justify-between gap-2'
            >
              <div className='flex flex-col items-start gap-2 lg:gap-2.5'>
                <div className='flex items-center gap-2'>
                  <Avatar className='h-10 w-10 border border-neutral-900'>
                    <AvatarImage src={author?.avatarUrl ?? undefined} />
                    <AvatarFallback className='bg-neutral-800 text-xs font-bold'>
                      {author?.name?.[0] ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <span className='text-xs font-semibold lg:text-sm'>
                      {author?.name || 'User'}
                    </span>
                    <span className='text-xs text-neutral-400 lg:text-sm'>
                      {comment.createdAt
                        ? dayjs(comment.createdAt).fromNow()
                        : ''}
                    </span>
                  </div>
                </div>
                <p className='text-xs lg:text-sm'>{comment.text}</p>
              </div>

              {isCommentOwner && (
                <button
                  type='button'
                  onClick={() => setDeletingCommentId(comment.id)}
                  disabled={isDeleting}
                  className='group-hover:opacity-100 text-neutral-400 hover:text-accent-red transition p-1 cursor-pointer shrink-0'
                  aria-label='Delete comment'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {deletingCommentId !== null && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
          <div className='flex flex-col w-full max-w-80 rounded-2xl bg-neutral-950 border border-neutral-800 p-5 gap-4 text-center text-neutral-25 animate-in fade-in zoom-in-95 duration-150'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-sm font-bold'>Delete Comment?</h3>
              <p className='text-xs text-neutral-400'>
                Are you sure you want to delete this comment? This action cannot
                be undone.
              </p>
            </div>

            <div className='flex items-center gap-2 w-full'>
              <button
                type='button'
                onClick={() => setDeletingCommentId(null)}
                className='flex-1 h-9 rounded-full border border-neutral-700 text-xs font-bold hover:bg-neutral-800 transition cursor-pointer text-neutral-25'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => handleConfirmDelete(deletingCommentId)}
                disabled={isDeleting}
                className='flex-1 h-9 rounded-full bg-red-600 hover:bg-red-700 text-xs font-bold text-neutral-25 transition cursor-pointer disabled:opacity-50'
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
