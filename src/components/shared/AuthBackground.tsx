import Image from 'next/image';
import Gradient from '@/assets/image/Gradient.png';

// src/components/auth/AuthBackgroundGlow.tsx
export default function AuthBackgroundGlow() {
  return (
    <div className='absolute bottom-0 left-0 right-0 w-full h-[233.1875px] lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:h-250 pointer-events-none select-none'>
      <Image
        src={Gradient}
        alt='Background gradient'
        fill
        priority
        className='object-cover'
      />
    </div>
  );
}
