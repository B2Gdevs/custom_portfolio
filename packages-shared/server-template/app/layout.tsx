import type { Metadata } from 'next';
import '../styles/globals.css';
import { BrandedLayout } from '../components/BrandedLayout';

export const metadata: Metadata = {
  title: 'Package Demo',
  description: 'Interactive demo showcase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BrandedLayout>{children}</BrandedLayout>
      </body>
    </html>
  );
}

