/**
 * Authorization for **`enableCopilotTools`** on `POST /api/chat` (global-tooling-05-02).
 *
 * - Set **`COPILOT_TOOLS_BEARER`** and send `Authorization: Bearer <token>` (recommended for prod).
 * - Or set **`SITE_CHAT_COPILOT_TOOLS=1`** without a bearer (local dev only — anyone can call tools).
 */
export function isCopilotToolsAuthorized(request: Request): boolean {
  const bearer = process.env.COPILOT_TOOLS_BEARER?.trim();
  if (bearer) {
    const auth = request.headers.get('authorization')?.trim();
    return auth === `Bearer ${bearer}`;
  }
  const siteEnabled = process.env.SITE_CHAT_COPILOT_TOOLS?.trim().toLowerCase();
  return siteEnabled === '1' || siteEnabled === 'true' || siteEnabled === 'yes';
}
