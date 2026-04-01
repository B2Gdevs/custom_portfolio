/* eslint-disable @next/next/no-img-element */
// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { SidebarAccountSection } from '@/components/auth/SidebarAccountSection';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuthSession } from '@/lib/auth/use-auth-session';

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { alt, fill, ...imgProps } = props;
    void fill;
    return <img {...imgProps} alt={String(alt ?? '')} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(),
}));

vi.mock('@/lib/auth/use-auth-session', () => ({
  useAuthSession: vi.fn(),
}));

describe('SidebarAccountSection', () => {
  beforeEach(() => {
    vi.mocked(useSidebar).mockReturnValue({
      state: 'expanded',
    } as ReturnType<typeof useSidebar>);
  });

  it('renders a sign-in prompt for anonymous sessions', () => {
    vi.mocked(useAuthSession).mockReturnValue({
      loading: false,
      session: null,
      reload: vi.fn(),
      logout: vi.fn(),
    });

    render(<SidebarAccountSection />);

    expect(screen.getByText('Owner account')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login?next=/admin',
    );
  });

  it('renders owner identity, org context, and logout controls for authenticated sessions', () => {
    const logout = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useAuthSession).mockReturnValue({
      loading: false,
      session: {
        authenticated: true,
        autoLoggedIn: true,
        isOwner: true,
        user: {
          id: 'user_1',
          email: 'owner@magicborn.local',
          displayName: 'Ben Garrard',
          avatarUrl: '/images/my_avatar.jpeg',
        },
        role: 'owner',
        tenant: {
          id: 'tenant_1',
          slug: 'magicborn-studios',
          name: 'Magicborn Studios',
        },
        entitlements: ['admin:access'],
        features: {
          reader: {
            persist: true,
            edit: true,
            upload: true,
          },
          listen: {
            privateAccess: true,
          },
          admin: {
            access: true,
          },
        },
      },
      reload: vi.fn(),
      logout,
    });

    render(<SidebarAccountSection />);

    expect(screen.getByText('Ben Garrard')).toBeInTheDocument();
    expect(screen.getByText('owner@magicborn.local')).toBeInTheDocument();
    expect(screen.getByText('Magicborn Studios')).toBeInTheDocument();
    expect(screen.getByText('magicborn-studios')).toBeInTheDocument();
    expect(screen.getByText('Tenant ID: tenant_1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});
