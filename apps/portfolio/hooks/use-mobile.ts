import * as React from "react"

/** Align with Tailwind `lg` (1024px) — site chrome uses `lg:` for sidebar visibility. */
const MOBILE_BREAKPOINT = 1024

const MOBILE_MQL = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribeMobileViewport(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_MQL)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQL).matches
}

/** SSR / first paint: assume desktop so layout matches server output; client updates immediately. */
function getServerMobileSnapshot() {
  return false
}

/**
 * Subscribes to viewport width without a useEffect flash (sidebar Sheet vs rail).
 * Uses `useSyncExternalStore` so SSR and hydration agree on the server snapshot.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeMobileViewport,
    getMobileSnapshot,
    getServerMobileSnapshot
  )
}
