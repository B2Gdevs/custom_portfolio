import type { Metadata } from 'next';
  import './globals.css';
import Nav from '@/components/layout/Nav';

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
        <Nav />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t-4 border-primary bg-dark-alt py-8 mt-16">
          <div className="max-w-7xl mx-auto px-6 text-center text-green-300">
            <p>© {new Date().getFullYear()} Portfolio. Built with Next.js, MDX, and SQLite.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
