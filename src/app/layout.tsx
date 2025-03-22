import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Media Stream',
  description: 'Stream your media files from anywhere on your network',
};

// Fix viewport warning by using the proper export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}