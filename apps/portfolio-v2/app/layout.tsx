import type { Metadata } from 'next';
import './globals.css';
import { ClerkProviderWrapper } from '@/components/auth/ClerkProviderWrapper';

export const metadata: Metadata = {
  title: 'Reader',
  description: 'Portfolio reader',
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
      </body>
    </html>
  );
}
