import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/providers/AppProvider';
import AuthHydration from '@/components/shared/AuthHydration';

export const metadata: Metadata = {
  title: 'Sociality',
  description: 'Social media web application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='h-full antialiased'>
      <body className='min-h-full flex flex-col font-sans'>
        <Providers>
          <AuthHydration />
          {children}
        </Providers>
      </body>
    </html>
  );
}
