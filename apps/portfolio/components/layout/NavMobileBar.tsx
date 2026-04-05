'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';

type NavMobileBarProps = {
  logoSrc: string;
  isImmersiveApp: boolean;
};

export function NavMobileBar({ logoSrc, isImmersiveApp }: NavMobileBarProps) {
  return (
    <div className="flex w-full shrink-0 grow-0 basis-full border-b border-border/80 bg-dark-alt/85 px-4 py-4 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="sidebar-logo-wrap shrink-0">
            <Image
              src={logoSrc}
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full bg-zinc-900/60 p-1 logo-hover-green"
            />
          </div>
          <div className="min-w-0">
            <span className="block text-xs uppercase tracking-[0.28em] text-text-muted">Ben Garrard</span>
            <span className="font-display text-lg text-primary">Story, sound, systems</span>
          </div>
        </Link>

        {isImmersiveApp ? (
          <Link
            href="/apps"
            className="shrink-0 rounded-full border border-border bg-dark px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-dark-elevated hover:text-primary"
          >
            Apps
          </Link>
        ) : (
          <SidebarTrigger className="shrink-0 border-border bg-dark text-text-muted hover:bg-dark-elevated hover:text-primary" />
        )}
      </div>
    </div>
  );
}
