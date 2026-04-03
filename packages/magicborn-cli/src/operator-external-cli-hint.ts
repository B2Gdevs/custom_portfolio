/** User hint when `magicborn claude` / `magicborn codex` are invoked — we do not spawn those binaries. */
export function formatExternalOperatorCliHint(
  command: 'claude' | 'codex',
  args: string[],
  repoRoot: string,
): string {
  const product = command === 'claude' ? 'Claude Code' : 'Codex';
  const tail = args.length > 0 ? ` ${args.join(' ')}` : '';
  return (
    `[magicborn] "${command}" is not forwarded. Install the ${product} CLI on PATH, then:\n` +
    `  cd "${repoRoot}" && ${command}${tail}\n` +
    '  (shell-init adds `cdmb` to jump to MAGICBORN_REPO.)'
  );
}
