import Link from 'next/link';
import Image from 'next/image';
import LogoIcon from '@/assets/icons/Logo.svg';

interface LogoProps {
  wrapClassName?: string;
  logoClassName?: string;
  textClassName?: string;
}

const Logo = ({
  wrapClassName = '',
  logoClassName = 'w-7.5 h-7.5',
  textClassName = 'text-display-xs font-bold text-neutral-25',
}: LogoProps) => {
  return (
    <Link
      href='/'
      className={`flex items-center gap-2.75 cursor-pointer group ${wrapClassName}`}
    >
      <div className={`relative shrink-0 ${logoClassName}`}>
        <Image src={LogoIcon} alt='Logo' fill className='object-contain' />
      </div>
      <span className={` ${textClassName}`}>Sociality</span>
    </Link>
  );
};

export default Logo;
