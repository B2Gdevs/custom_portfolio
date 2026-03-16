import type { Metadata } from 'next';
import './globals.css';
import { ConditionalLayout } from '@/components/layout/ConditionalLayout';
import { getAllContent } from '@/lib/content';
import { getResumes } from '@/lib/resumes';
import { buildSiteMenus } from '@/lib/site-menus';

export const metadata: Metadata = {
  title: 'Ben Garrard | Story, Sound, and Systems',
  description: 'A book-first portfolio for fiction, songs, and the technical archive behind them.',
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
  const navMenus = buildSiteMenus({
    projects: getAllContent('projects'),
    blogPosts: getAllContent('blog'),
    docs: getAllContent('docs'),
    resumes: getResumes().map(({ slug, title }) => ({ slug, title })),
  });

  return (
    <html lang="en">
      <body>
        <ConditionalLayout navMenus={navMenus}>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
