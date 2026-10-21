'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Alert = ({
  type,
  message,
  onClose,
  className = '',
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const bgClass = type === 'success' ? 'bg-accent-green' : 'bg-accent-red';

  if (!isVisible) return null;

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 gap-2 rounded-[8px] ${bgClass} text-white font-semibold text-sm ${className}`}
    >
      <span>{message}</span>
      <button
        type='button'
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className='hover:bg-white/20 transition-colors cursor-pointer shrink-0'
        aria-label='Close alert'
      >
        <X className='w-4 h-4 text-white' />
      </button>
    </div>
  );
};
