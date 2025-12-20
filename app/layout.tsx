import type { Metadata } from 'next';
import './globals.css';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: 'Portfolio - Software Architecture & Documentation',
  description: 'A sleek, neobrutal portfolio showcasing software architecture, projects, and documentation',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
