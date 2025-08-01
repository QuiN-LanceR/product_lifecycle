import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';

import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LoadingProvider } from '@/context/LoadingProvider';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Product Lifecycle',
    template: '%s | Product Lifecycle'
  },
  description: 'Admin page Product LifeCycle PLN ICON +',
  keywords: ['product lifecycle', 'PLN', 'admin', 'management'],
  authors: [{ name: 'PLN ICON +' }],
  creator: 'PLN ICON +',
  publisher: 'PLN ICON +',
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${inter.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <LoadingProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </LoadingProvider>
        </ThemeProvider>  
      </body>
    </html>
  );
}