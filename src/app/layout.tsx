import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/providers/AppProvider';

export const metadata: Metadata = {
  title: 'Sociality',
  description: 'Social media web application',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='en' className='h-full antialiased'>
      <body className='min-h-full flex flex-col font-sans'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
