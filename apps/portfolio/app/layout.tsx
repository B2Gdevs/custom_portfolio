import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { ClerkProviderWrapper } from '@/components/auth/ClerkProviderWrapper';
import { VercelAnalytics } from '@/components/analytics/VercelAnalytics';
import { ContentCommandPaletteHotkey } from '@/components/content/ContentCommandPaletteHotkey';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { ModalRoot } from '@/components/modals/ModalRoot';
import { SiteCopilot } from '@/components/site/SiteCopilot';
import { SiteCopilotProvider } from '@/components/site/SiteCopilotContext';
import { getAllContent } from '@/lib/content';
import { buildSiteMenus } from '@/lib/site-menus';
import { hostSuggestsLocalPortfolioAccess } from '@/lib/site-copilot-shell';
import { getActiveSiteLogoPublicUrl } from '@/lib/site-branding';
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

const fontSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
});

const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Ben Garrard | Story, Sound, and Systems',
  description: 'A book-first portfolio for fiction, songs, and the technical archive behind them.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navMenus = buildSiteMenus({
    projects: getAllContent('projects'),
    blogPosts: getAllContent('blog'),
  });

  const siteLogoSrc = await getActiveSiteLogoPublicUrl();

  const h = await headers();
  const host =
    h.get('x-forwarded-host')?.split(',')[0]?.trim() ?? h.get('host') ?? '';

  /** Show launcher when chat is not explicitly disabled; local / dev / LAN host shows shell even without OPENAI_API_KEY (API still rejects until key is set). */
  const siteChatEnabled =
    process.env.NEXT_PUBLIC_SITE_CHAT !== '0' &&
    (Boolean(process.env.OPENAI_API_KEY?.trim()) ||
      process.env.NEXT_PUBLIC_SITE_CHAT_SHOW === '1' ||
      process.env.NODE_ENV === 'development' ||
      (hostSuggestsLocalPortfolioAccess(host) &&
        process.env.NEXT_PUBLIC_SITE_CHAT_HIDE_ON_LAN !== '1'));

  const siteShell = (
    <>
      <SiteLayout navMenus={navMenus} siteLogoSrc={siteLogoSrc ?? undefined}>
        {children}
      </SiteLayout>
      <ContentCommandPaletteHotkey />
      <ModalRoot />
    </>
  );

  return (
    <html
      lang="en"
      className={cn(
        'dark font-sans',
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable,
      )}
      suppressHydrationWarning
    >
      <body>
        <ClerkProviderWrapper>
          {siteChatEnabled ? (
            <SiteCopilotProvider>
              {siteShell}
              <div
                data-testid="site-copilot-shell"
                className="fixed inset-0 z-[130] pointer-events-none"
              >
                <SiteCopilot />
              </div>
            </SiteCopilotProvider>
          ) : (
            siteShell
          )}
        </ClerkProviderWrapper>
        <VercelAnalytics />
      </body>
    </html>
  );
}
