import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Shared “back to index” pattern for blog and project detail pages. */
export function ContentBackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline',
        className,
      )}
    >
      <ArrowLeft size={16} aria-hidden />
      <span>{children}</span>
    </Link>
  );
}
