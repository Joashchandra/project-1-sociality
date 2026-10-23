'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { Post, Comment } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Smile,
  MoreHorizontal,
} from 'lucide-react';
import {
  usePostComments,
  useAddCommentMutation,
  useDeleteCommentMutation,
} from '@/hooks/useComments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { CommentList } from '@/components/shared/CommentList';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface CommentModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onShowAlert?: (alert: { type: 'success' | 'error'; message: string }) => void;
}

const EMOJIS = [
  '😀',
  '😅',
  '🥰',
  '😇',
  '🙂',
  '😋',
  '🤪',
  '🤐',
  '😏',
  '🤗',
  '😪',
  '🙄',
  '🤫',
  '😴',
  '🥵',
  '😫',
  '😭',
  '😱',
];

export function CommentModal({
  post,
  isOpen,
  onClose,
  onShowAlert,
}: CommentModalProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const { isLoggedIn, user: currentUser } = useCurrentUser();
  const postId = post?.id ?? 0;

  const { data: commentsResponse, isLoading } = usePostComments(postId, isOpen);
  const addCommentMutation = useAddCommentMutation(postId);
  const deleteCommentMutation = useDeleteCommentMutation(postId);

  const commentsList: Comment[] =
    commentsResponse?.data?.comments ?? commentsResponse?.data?.items ?? [];

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

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !post) return null;

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!isLoggedIn) {
      onShowAlert?.({
        type: 'error',
        message: 'Please log in to leave a comment.',
      });
      return;
    }

    addCommentMutation.mutate(
      { text: text.trim() },
      {
        onSuccess: () => {
          setText('');
          setShowEmojiPicker(false);
        },
        onError: (err: Error) => {
          onShowAlert?.({
            type: 'error',
            message: err.message || 'Failed to post comment.',
          });
        },
      }
    );
  };

  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId, {
      onError: (err: Error) => {
        onShowAlert?.({
          type: 'error',
          message: err.message || 'Failed to delete comment.',
        });
      },
    });
  };

  const renderCommentForm = () => (
    <form
      onSubmit={handleSubmit}
      className='relative border-t border-neutral-900 bg-neutral-950'
    >
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className='absolute bottom-16 left-3 z-50 grid grid-cols-6 p-4 gap-2.5 rounded-[12px] border border-neutral-900 bg-neutral-950'
        >
          {EMOJIS.map((emoji, i) => (
            <button
              key={i}
              type='button'
              onClick={() => handleSelectEmoji(emoji)}
              className='flex h-6 w-6 items-center justify-center rounded-lg text-lg hover:bg-neutral-800 transition cursor-pointer'
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className='flex items-center gap-2 rounded-full'>
        <button
          type='button'
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className='flex items-center justify-center w-12 h-12 border border-neutral-900 text-neutral-400 hover:text-neutral-25 transition cursor-pointer shrink-0'
          aria-label='Add emoji'
        >
          <Smile className='h-6 w-6' />
        </button>
        <div className='flex w-full gap-0.5 h-12 px-4 py-2 rounded-xl border border-neutral-900'>
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Add Comment'
            className='flex w-full text-sm lg:text-md font-medium text-neutral-25 placeholder:text-neutral-600 focus:outline-none'
          />

          <button
            type='submit'
            disabled={!text.trim() || addCommentMutation.isPending}
            className='text-sm font-bold text-primary-300 hover:text-primary-200 disabled:text-neutral-600 transition cursor-pointer px-2'
          >
            {addCommentMutation.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className='fixed inset-0 z-50 flex lg:flex-col items-end lg:items-center justify-center bg-black/80 backdrop-blur-sm lg:mx-4'>
      <div className='flex flex-col w-full gap-2 lg:max-w-300'>
        <div className='flex flex-col w-full px-4 gap-2 items-end lg:p-none'>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center bg-none text-neutral-25 cursor-pointer'
            aria-label='Close comments'
          >
            <X className='h-4 w-4 lg:h-6 lg:w-6' />
          </button>
        </div>

        <div className='relative flex flex-col w-full max-h-142.5 h-[85vh] p-4 pb-8 rounded-t-2xl bg-neutral-950 text-neutral-25 border-t border-neutral-900 animate-in slide-in-from-bottom duration-300 lg:hidden overflow-hidden'>
          <h2 className='flex items-center px-4 text-sm font-bold text-neutral-25'>
            Comments
          </h2>

          <CommentList
            comments={commentsList}
            isLoading={isLoading}
            currentUser={currentUser}
            onDeleteComment={handleDeleteComment}
            isDeleting={deleteCommentMutation.isPending}
          />

          {renderCommentForm()}
        </div>
      </div>

      <div className='relative hidden lg:flex h-180 w-full max-w-300 overflow-hidden bg-neutral-950 text-neutral-25'>
        <div className='relative flex-1'>
          <Image
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
            fill
            unoptimized
            className='object-cover'
          />
        </div>

        <div className='flex w-110 flex-col justify-between bg-neutral-950'>
          <div className='flex items-center justify-between p-4'>
            <div className='flex items-center gap-3.25'>
              <Avatar className='h-10 w-10 border border-neutral-800'>
                <AvatarImage src={post.author?.avatarUrl ?? undefined} />
                <AvatarFallback className='bg-neutral-800 text-xs font-bold'>
                  {post.author?.name?.[0] ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-0.5'>
                <span className='text-sm font-bold text-neutral-25'>
                  {post.author?.name || 'User'}
                </span>
                <span className='text-xs text-neutral-400'>
                  {post.createdAt ? dayjs(post.createdAt).fromNow() : ''}
                </span>
              </div>
            </div>

            <button
              type='button'
              className='text-neutral-400 hover:text-neutral-25 transition'
            >
              <MoreHorizontal className='h-5 w-5' />
            </button>
          </div>

          {post.caption && (
            <div className='border-b border-neutral-900 pb-4 text-sm text-neutral-300 leading-relaxed'>
              {post.caption}
            </div>
          )}

          <CommentList
            comments={commentsList}
            isLoading={isLoading}
            currentUser={currentUser}
            onDeleteComment={handleDeleteComment}
            isDeleting={deleteCommentMutation.isPending}
          />

          <div className='flex items-center justify-between border-t border-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-300'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1.5'>
                <Heart className='h-4 w-4 text-accent-red fill-accent-red' />
                <span>{post.likeCount ?? post._count?.likes ?? 0}</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <MessageCircle className='h-4 w-4 text-neutral-400' />
                <span>
                  {commentsList.length ||
                    post.commentCount ||
                    post._count?.comments ||
                    0}
                </span>
              </div>
              <div className='flex items-center gap-1.5'>
                <Send className='h-4 w-4 text-neutral-400' />
                <span>0</span>
              </div>
            </div>

            <button
              type='button'
              className='text-neutral-400 hover:text-neutral-25 transition'
            >
              <Bookmark className='h-4 w-4' />
            </button>
          </div>

          {renderCommentForm()}
        </div>
      </div>
    </div>
  );
}
