'use client';

import type { MouseEventHandler } from 'react';
import { usePathname } from 'next/navigation';
import { NavMobileBar } from '@/components/layout/NavMobileBar';
import { DEFAULT_SITE_LOGO } from '@/components/layout/nav-config';
import { PortfolioSidebarInner } from '@/components/layout/nav-sidebar';
import type { NavMenuSection } from '@/lib/site-menus';
import { isImmersiveAppsRoute } from '@/lib/app-routes';
import { Sidebar, SidebarRail } from '@/components/ui/sidebar';

export default function Nav({
  navMenus,
  siteLogoSrc,
  portfolioSidebarHoverHandlers,
}: {
  navMenus: NavMenuSection[];
  siteLogoSrc?: string | null;
  portfolioSidebarHoverHandlers?: {
    onMouseEnter?: MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  };
}) {
  const pathname = usePathname();
  const logoSrc = siteLogoSrc || DEFAULT_SITE_LOGO;
  const isImmersiveApp = isImmersiveAppsRoute(pathname);

  return (
    <>
      <NavMobileBar logoSrc={logoSrc} isImmersiveApp={isImmersiveApp} />

      {!isImmersiveApp ? (
        <Sidebar
          collapsible="icon"
          className="z-10 border-r border-sidebar-border/80 bg-sidebar/90 backdrop-blur-xl"
          {...portfolioSidebarHoverHandlers}
        >
          <PortfolioSidebarInner
            pathname={pathname ?? ''}
            navMenus={navMenus}
            siteLogoSrc={siteLogoSrc}
          />
          <SidebarRail />
        </Sidebar>
      ) : null}
    </>
  );
}
