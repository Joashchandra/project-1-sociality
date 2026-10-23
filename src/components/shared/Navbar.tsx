'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X, Search, XCircle } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Logo from './Logo';
import SearchResultsList from './SearchResultList';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isLoggedIn, isMounted } = useCurrentUser();

  const { data: searchResults, isLoading } = useUserSearch(searchQuery, 10);
  const usersList = searchResults?.users || [];
  const hasTyped = searchQuery.trim().length > 0;

  const handleCloseMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <nav className='relative flex items-center h-[64px] lg:h-20 top-0 z-50 bg-black border-b border-neutral-900 px-4 xl:px-30'>
      <div className='flex w-full items-center justify-between gap-4'>
        {isMobileSearchOpen ? (
          <div className='fixed inset-0 z-50 bg-black flex flex-col lg:hidden'>
            <div className='flex items-center border-b border-neutral-900 px-4 h-[64px] gap-3 w-full'>
              <div className='relative flex-1'>
                <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400' />
                <Input
                  type='text'
                  placeholder='Search'
                  autoFocus
                  className='pl-10 pr-9 bg-[#111318] border-neutral-800 text-white rounded-full h-10 text-sm focus-visible:ring-purple-500'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white'
                  >
                    <XCircle className='h-4 w-4 fill-neutral-600 text-black' />
                  </button>
                )}
              </div>

              <button
                onClick={handleCloseMobileSearch}
                className='p-2 text-neutral-25 hover:text-white'
                aria-label='Close search'
              >
                <X className='h-6 w-6' />
              </button>
            </div>

            {hasTyped && (
              <div className='flex-1 overflow-y-auto mt-4'>
                <SearchResultsList
                  users={usersList}
                  isLoading={isLoading}
                  isMobileOverlay
                  onSelectUser={handleCloseMobileSearch}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <Logo />

            <div className='relative hidden lg:flex flex-1 justify-center'>
              <div className='relative w-full max-w-122.75'>
                <div className='relative flex items-center'>
                  <Search className='absolute left-3.5 h-4 w-4 text-neutral-400' />
                  <Input
                    type='search'
                    placeholder='Search'
                    className='pl-10 pr-9 w-full bg-[#111318] border-neutral-800 text-white placeholder:text-neutral-500 rounded-full h-10 focus-visible:ring-purple-500'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white'
                    >
                      <XCircle className='h-4 w-4 fill-neutral-600 text-black' />
                    </button>
                  )}
                </div>

                {hasTyped && (
                  <div className='absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-neutral-950 rounded-2xl shadow-2xl overflow-y-auto z-50 max-h-96 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
                    <SearchResultsList
                      users={usersList}
                      isLoading={isLoading}
                      onSelectUser={() => setSearchQuery('')}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className='hidden lg:flex items-center gap-4 text-white'>
              {!isMounted ? (
                <div className='h-9 w-24 bg-neutral-900 animate-pulse rounded-full' />
              ) : isLoggedIn && user ? (
                <div className='flex items-center gap-3'>
                  <Link
                    href='/me'
                    className='flex items-center gap-2 hover:opacity-80 transition-opacity'
                  >
                    <Avatar className='h-9 w-9 border border-neutral-800'>
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className='bg-neutral-800 text-white font-bold'>
                        {user.name ? user.name[0] : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-semibold'>{user.name}</span>
                  </Link>
                </div>
              ) : (
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    asChild
                    className='border-neutral-800 bg-transparent text-white hover:bg-neutral-800 rounded-full px-6'
                  >
                    <Link href='/login'>Login</Link>
                  </Button>
                  <Button
                    asChild
                    className='bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-full px-6'
                  >
                    <Link href='/register'>Register</Link>
                  </Button>
                </div>
              )}
            </div>

            <div className='flex lg:hidden items-center gap-3'>
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className='p-1.5 text-neutral-25 hover:text-white'
                aria-label='Open Search'
              >
                <Search className='h-5 w-5' />
              </button>

              {isMounted && isLoggedIn && user ? (
                <Link href='/me'>
                  <Avatar className='h-8 w-8 border border-neutral-800'>
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className='bg-neutral-800 text-white font-bold'>
                      {user.name ? user.name[0] : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : isMounted ? (
                <div className='relative'>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className='p-1.5 text-neutral-25 hover:text-white transition-colors'
                    aria-label='Toggle Menu'
                  >
                    {isMobileMenuOpen ? (
                      <X className='h-6 w-6' />
                    ) : (
                      <Menu className='h-6 w-6' />
                    )}
                  </button>

                  {isMobileMenuOpen && (
                    <div className='absolute right-0 top-full mt-3 w-56 bg-[#111318] border border-neutral-800 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 z-50'>
                      <Button
                        variant='outline'
                        asChild
                        className='w-full border-neutral-800 bg-transparent text-white hover:bg-neutral-800 rounded-full h-9 text-xs'
                      >
                        <Link
                          href='/login'
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className='w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white rounded-full h-9 text-xs'
                      >
                        <Link
                          href='/register'
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
