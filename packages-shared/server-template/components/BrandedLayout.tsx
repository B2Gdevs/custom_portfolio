'use client';

import Link from 'next/link';
import { Home, Github, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface BrandedLayoutProps {
  children: React.ReactNode;
  packageName?: string;
  packageDescription?: string;
  packageRepo?: string;
  portfolioUrl?: string;
}

export function BrandedLayout({
  children,
  packageName = 'Package Demo',
  packageDescription,
  packageRepo,
  portfolioUrl = 'https://your-portfolio.com',
}: BrandedLayoutProps) {
  const [copied, setCopied] = useState(false);
  const email = 'benjamingarrard5279@gmail.com';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1a1a2e] bg-[#0d0d14]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={portfolioUrl}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/logo.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full bg-zinc-900/60 p-1"
                />
                <span className="text-sm font-semibold text-zinc-200">
                  Ben Garrard
                </span>
              </Link>
              <div className="h-4 w-px bg-zinc-700" />
              <div>
                <h1 className="text-sm font-semibold text-white">{packageName}</h1>
                {packageDescription && (
                  <p className="text-xs text-zinc-400">{packageDescription}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {packageRepo && (
                <a
                  href={packageRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
                >
                  <Github size={16} />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}
              <Link
                href={portfolioUrl}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
              >
                <ExternalLink size={16} />
                <span className="hidden sm:inline">Portfolio</span>
              </Link>
              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="hidden sm:inline">
                  {copied ? 'Copied!' : 'Email'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] bg-[#0d0d14] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">
              <p>© {new Date().getFullYear()} Ben Garrard</p>
              <p className="text-xs mt-1">Built with Next.js and TypeScript</p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href={portfolioUrl}
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Portfolio
              </Link>
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

