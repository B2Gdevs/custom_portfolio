'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, FileText, Settings, Copy, Check } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/projects', label: 'Projects', icon: Briefcase },
  { href: '/blog', label: 'Blog', icon: FileText },
];

// Update this if you use a different email provider
const EMAIL = 'benjamingarrard5279@gmail.com';

export default function Nav() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  // Hide Nav on dialogue-forge route (it has its own full-screen layout)
  if (pathname?.startsWith('/dialogue-forge')) {
    return null;
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silently fail if clipboard API is unavailable
    }
  };

  return (
    <nav className="sticky top-0 z-50 px-4 py-4 backdrop-blur-lg">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between rounded-full bg-dark-alt/80 border border-border/70 px-4 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full px-3 py-1 hover:bg-white/5 transition-colors"
          >
            <img
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full bg-zinc-900/60 p-1 logo-hover-green"
            />
            <span className="text-sm font-semibold tracking-tight uppercase text-zinc-200">
              Ben Garrard
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  <Icon size={16} className="hidden sm:inline" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {process.env.NODE_ENV === 'development' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <Settings size={16} />
                <span>Admin</span>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium shadow-sm hover:bg-zinc-100 active:scale-[0.98] transition transform"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </span>
            <span className="hidden sm:inline min-w-[200px] text-left">
              {copied ? 'Copied!' : EMAIL}
            </span>
            <span className="sm:hidden min-w-[80px] text-left">{copied ? 'Copied!' : 'Email me'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

