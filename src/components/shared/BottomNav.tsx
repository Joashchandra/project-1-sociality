'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { CreatePostModal } from './CreatePost';
import { Alert } from './Alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function BottomNav() {
  const pathname = usePathname();
  const { isLoggedIn, isMounted } = useCurrentUser();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [alertState, setAlertState] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!isMounted || !isLoggedIn) return null;

  const isHomeActive = pathname === '/' || pathname === '/feed';
  const isProfileActive = pathname === '/me';

  const handleShowAlert = (alert: {
    type: 'success' | 'error';
    message: string;
  }) => {
    setAlertState(alert);
    setTimeout(() => {
      setAlertState(null);
    }, 4000);
  };
  return (
    <>
      {alertState && (
        <div className='fixed top-21.5 right-5 left-5 lg:left-auto lg:right-5 z-50 flex h-10 w-auto lg:top-28 lg:max-w-72.75 lg:w-full'>
          <Alert
            type={alertState.type}
            message={alertState.message}
            onClose={() => setAlertState(null)}
            className='w-full'
          />
        </div>
      )}
      <nav className='fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between w-full max-w-86.25 bg-neutral-950/90 backdrop-blur-md border border-neutral-900 rounded-full px-8 py-3 transition-all gap-11.25'>
        <Link
          href='/feed'
          className={`flex flex-col items-center gap-1 transition ${
            isHomeActive
              ? 'text-primary-200'
              : 'text-neutral-25 hover:underline'
          }`}
        >
          <div className='relative flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6'>
            <svg
              className='w-4 h-4 lg:w-5 lg:h-5'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <defs>
                <mask id='door-cutout'>
                  <rect x='0' y='0' width='24' height='24' fill='white' />
                  <path
                    d='M10 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8h-4z'
                    fill='black'
                  />
                </mask>
              </defs>

              <path
                fill='currentColor'
                stroke='none'
                mask='url(#door-cutout)'
                d='M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
              />

              <path
                fill='none'
                d='M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
              />

              <path
                fill='none'
                d='M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'
              />
            </svg>
          </div>
          <span className='text-xs font-semibold'>Home</span>
        </Link>

        <button
          type='button'
          onClick={() => setIsCreateModalOpen(true)}
          className='flex items-center justify-center w-12 h-12 p-2 gap-2 rounded-full bg-primary-300 hover:bg-primary-200 text-neutral-25 transition active:scale-95 cursor-pointer'
          aria-label='Create Post'
        >
          <Plus className='w-6 h-6' />
        </button>

        <Link
          href='/me'
          className={`flex flex-col items-center gap-1 transition ${
            isProfileActive
              ? 'text-primary-200 font-semibold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='currentColor'
            stroke='none'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M 12 22 A 10 10 0 0 1 6.074 20.057 A 6 6 0 0 1 17.925 20.056 A 10 10 0 0 1 12 22 Z' />
            <circle cx='12' cy='9' r='5' />
          </svg>
          <span className='text-xs font-semibold'>Profile</span>
        </Link>
      </nav>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onShowAlert={handleShowAlert}
      />
    </>
  );
}
