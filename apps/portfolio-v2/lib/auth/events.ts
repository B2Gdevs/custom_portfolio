export const PORTFOLIO_AUTH_CHANGED_EVENT = 'portfolio-auth-changed';

export function dispatchPortfolioAuthChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PORTFOLIO_AUTH_CHANGED_EVENT));
}
