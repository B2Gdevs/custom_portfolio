'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, LoaderCircle, LogOut, Shield, UserCircle2 } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuthSession } from '@/lib/auth/use-auth-session';
import { isClerkConfigured } from '@/lib/auth/use-clerk-auth';
import { cn } from '@/lib/utils';

/** Dynamically loaded Clerk components */
function ClerkSignInButton({ children, mode = 'modal' }: { children: React.ReactNode; mode?: 'modal' | 'redirect' }) {
  const [SignInButton, setSignInButton] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (isClerkConfigured()) {
      import('@clerk/nextjs').then((mod) => {
        setSignInButton(() => mod.SignInButton);
      }).catch(() => {});
    }
  }, []);

  if (!SignInButton) {
    return <>{children}</>;
  }

  return <SignInButton mode={mode}>{children}</SignInButton>;
}

function ClerkUserButton() {
  const [UserButton, setUserButton] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (isClerkConfigured()) {
      import('@clerk/nextjs').then((mod) => {
        setUserButton(() => mod.UserButton);
      }).catch(() => {});
    }
  }, []);

  if (!UserButton) return null;

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: 'size-10',
          userButtonTrigger: 'focus:shadow-none',
        },
      }}
      afterSignOutUrl="/"
    />
  );
}

function getUserLabel(displayName: string | null, email: string) {
  return displayName?.trim() || email;
}

function getAvatarInitials(displayName: string | null, email: string) {
  const label = getUserLabel(displayName, email).trim();
  const words = label.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }

  return label.slice(0, 2).toUpperCase();
}

function AccountAvatar({
  avatarUrl,
  displayName,
  email,
  sizeClass,
}: {
  avatarUrl: string | null;
  displayName: string | null;
  email: string;
  sizeClass: string;
}) {
  const initials = getAvatarInitials(displayName, email);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full border border-sidebar-border/80 bg-sidebar-accent/35',
        sizeClass,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={getUserLabel(displayName, email)}
          fill
          sizes="40px"
          className="object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-sidebar-foreground">
          {initials}
        </span>
      )}
    </div>
  );
}

export function SidebarAccountSection({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return <SidebarAccountSectionInner onNavigate={onNavigate} />;
}

function SidebarAccountSectionInner({
  onNavigate,
}: {
  onNavigate?: () => void;
} = {}) {
  const { state } = useSidebar();
  const { loading, session, logout } = useAuthSession();
  const collapsed = state === 'collapsed';

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/20 p-3 text-sidebar-foreground/70',
          collapsed && 'justify-center p-0 border-0 bg-transparent',
        )}
      >
        <LoaderCircle className="size-4 animate-spin" />
        <span className={cn('text-xs', collapsed && 'sr-only')}>Checking session</span>
      </div>
    );
  }

  if (!session?.authenticated || !session.user) {
    const clerkEnabled = isClerkConfigured();

    // Collapsed view - sign in button
    if (collapsed) {
      if (clerkEnabled) {
        return (
          <ClerkSignInButton mode="modal">
            <button
              title="Sign in"
              className="inline-flex size-10 items-center justify-center rounded-full border border-sidebar-border/80 bg-sidebar-accent/25 text-sidebar-foreground transition hover:bg-sidebar-accent"
            >
              <UserCircle2 className="size-5" />
            </button>
          </ClerkSignInButton>
        );
      }
      return (
        <Link
          href="/login?next=/admin"
          title="Owner sign in"
          onClick={onNavigate}
          className="inline-flex size-10 items-center justify-center rounded-full border border-sidebar-border/80 bg-sidebar-accent/25 text-sidebar-foreground transition hover:bg-sidebar-accent"
        >
          <UserCircle2 className="size-5" />
        </Link>
      );
    }

    // Expanded view - sign in card
    return (
      <div className="rounded-[1.4rem] border border-sidebar-border/80 bg-sidebar-accent/18 p-3">
        <p className="text-sm font-medium text-sidebar-foreground">
          {clerkEnabled ? 'Sign in' : 'Owner account'}
        </p>
        <p className="mt-1 text-xs leading-5 text-sidebar-foreground/65">
          Sign in to unlock private surfaces and operational tools.
        </p>
        {clerkEnabled ? (
          <ClerkSignInButton mode="modal">
            <button
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-sidebar-primary px-3 py-2 text-sm font-medium text-sidebar-primary-foreground transition hover:opacity-90"
            >
              Sign in
            </button>
          </ClerkSignInButton>
        ) : (
          <Link
            href="/login?next=/admin"
            onClick={onNavigate}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-sidebar-primary px-3 py-2 text-sm font-medium text-sidebar-primary-foreground transition hover:opacity-90"
          >
            Sign in
          </Link>
        )}
      </div>
    );
  }

  const userLabel = getUserLabel(session.user.displayName, session.user.email);
  const tenantName = session.tenant?.name ?? 'No organization';
  const tenantSlug = session.tenant?.slug ?? 'n/a';
  const tenantId = session.tenant?.id ?? 'n/a';

  if (collapsed) {
    return (
      <Link
        href={session.features.admin.access ? '/admin' : '/'}
        title={`${userLabel} - ${tenantName}`}
        onClick={onNavigate}
        className="inline-flex size-10 items-center justify-center rounded-full transition"
      >
        <AccountAvatar
          avatarUrl={session.user.avatarUrl}
          displayName={session.user.displayName}
          email={session.user.email}
          sizeClass="size-10"
        />
      </Link>
    );
  }

  return (
    <div className="rounded-[1.4rem] border border-sidebar-border/80 bg-sidebar-accent/18 p-3">
      <div className="flex items-center gap-3">
        <AccountAvatar
          avatarUrl={session.user.avatarUrl}
          displayName={session.user.displayName}
          email={session.user.email}
          sizeClass="size-11"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">{userLabel}</p>
          <p className="truncate text-xs text-sidebar-foreground/65">{session.user.email}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1 rounded-2xl border border-sidebar-border/70 bg-sidebar/55 px-3 py-2 text-xs text-sidebar-foreground/75">
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 shrink-0" />
          <span className="truncate">
            {session.role ?? 'member'}
            {session.autoLoggedIn ? ' - auto' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="size-3.5 shrink-0" />
          <span className="truncate">{tenantName}</span>
        </div>
        <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/55">
          {tenantSlug}
        </p>
        <p className="break-all font-mono text-[10px] text-sidebar-foreground/55">
          Tenant ID: {tenantId}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {session.features.admin.access ? (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-sidebar-border/80 bg-sidebar px-3 py-2 text-xs font-medium text-sidebar-foreground transition hover:bg-sidebar-accent"
          >
            Admin
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-sidebar-border/80 bg-sidebar px-3 py-2 text-xs font-medium text-sidebar-foreground transition hover:bg-sidebar-accent"
        >
          <LogOut className="size-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
