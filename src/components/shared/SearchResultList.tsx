import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';

interface SearchResultsListProps {
  users: User[];
  isLoading?: boolean;
  onSelectUser: () => void;
  className?: string;
  isMobileOverlay?: boolean;
}

export default function SearchResultsList({
  users,
  isLoading,
  onSelectUser,
  className = '',
  isMobileOverlay = false,
}: SearchResultsListProps) {
  if (isLoading) {
    return (
      <div
        className={`p-6 text-center text-neutral-25 text-md  border border-neutral-950 rounded-2xl ${
          isMobileOverlay
            ? 'flex-1 flex items-center justify-center bg-black'
            : 'bg-neutral-950'
        } ${className}`}
      >
        Searching...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center  border border-neutral-950 rounded-2xl ${
          isMobileOverlay ? 'flex-1 h-full bg-black' : 'bg-neutral-950'
        } ${className}`}
      >
        <p className='text-md font-bold text-neutral-25 mb-1'>
          No results found
        </p>
        <p className='text-sm text-neutral-400'>Change your keyword</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-4  border border-neutral-900 rounded-2xl overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
        isMobileOverlay ? 'flex-1 h-full px-4 bg-black' : 'p-5 bg-neutral-950'
      }  ${className}`}
    >
      {users.map((u) => (
        <Link
          key={u.id}
          href={`/profile/${u.username}`}
          onClick={onSelectUser}
          className='flex items-center gap-2 rounded-xl hover:bg-neutral-900 transition-colors'
        >
          <Avatar className='h-12 w-12 shrink-0'>
            <AvatarImage src={u.avatarUrl || undefined} />
            <AvatarFallback className='bg-neutral-900 text-white font-medium'>
              {u.name ? u.name[0] : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col min-w-0'>
            <p className='text-sm font-bold text-neutral-25 truncate'>
              {u.name}
            </p>
            <p className='text-sm text-neutral-400 truncate'>@{u.username}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
