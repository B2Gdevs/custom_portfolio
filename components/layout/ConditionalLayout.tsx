'use client';

import { usePathname } from 'next/navigation';
import Nav from './Nav';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDialogueForge = pathname?.startsWith('/dialogue-forge');

  if (isDialogueForge) {
    // Full-screen layout for dialogue-forge (no Nav, no footer, no main wrapper)
    return <>{children}</>;
  }

  // Normal layout with Nav and footer
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {children}
      </main>
      <footer className="border-t-4 border-primary bg-dark-alt py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-green-300">
          <p>© {new Date().getFullYear()} Portfolio. Built with Next.js, MDX, and SQLite.</p>
        </div>
      </footer>
    </>
  );
}




