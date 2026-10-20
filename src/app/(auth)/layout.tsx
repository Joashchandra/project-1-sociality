import AuthBackgroundGlow from '@/components/shared/AuthBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='relative min-h-screen flex items-center justify-center bg-black overflow-hidden'>
      <AuthBackgroundGlow />

      <div className='relative flex flex-col items-center z-10 w-full px-6 rounded-lg'>
        {children}
      </div>
    </div>
  );
}
