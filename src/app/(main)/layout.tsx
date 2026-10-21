import Navbar from '@/components/shared/Navbar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex flex-col bg-black'>
      <Navbar />
      <main className='flex flex-col items-center w-full px-6'>{children}</main>
    </div>
  );
}
