import path from 'node:path';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import {
  approxContextPctFromChars,
  CliContextMeter,
  CliFooterSlotRow,
  CliScreenBanner,
  formatRagModeLabel,
  handleSlashChatLine,
  isAcceptEditsAutoEnvLocked,
  parseSlashChatLine,
  readCliSession,
  resolveCliTheme,
  toggleAcceptEditsAuto,
  writeCliSessionMerge,
  type CliSessionV1,
} from '@magicborn/mb-cli-framework';
import { getVendorCompletionRows } from '../vendor-registry.js';
import { HOME_COMMAND_SECTIONS } from './home-sections.js';
import { execMagicbornCliArgv } from './exec-repl-argv.js';
import { parseReplLine } from './repl-parse.js';
import { ReplLineInput } from './ReplLineInput.js';

export type HomeSessionEndReason = 'quit' | 'chat';

export type MagicbornHomeBranding = {
  /** Product name (default: magicborn) */
  product?: string;
  /** One line under the title (ASCII / Unicode ok) */
  tagline?: string;
  /** Small footer line inside the header card */
  footnote?: string;
};

export type MagicbornHomeProps = {
  repoRoot: string;
  cliVersion: string;
  cliJs: string;
  branding?: MagicbornHomeBranding;
  onSessionEnd: (reason: HomeSessionEndReason) => void;
};

type TranscriptLine = { id: number; text: string; color?: string; dim?: boolean };

let transcriptSeq = 0;

function nextId(): number {
  transcriptSeq += 1;
  return transcriptSeq;
}

function shortenPath(p: string, max = 56): string {
  if (p.length <= max) return p;
  return `…${p.slice(-(max - 1))}`;
}

function buildHelpTranscript(theme: ReturnType<typeof resolveCliTheme>): TranscriptLine[] {
  const lines: TranscriptLine[] = [
    {
      id: nextId(),
      text: 'Commands (same as `magicborn …` in the shell). Leading / is optional.',
      color: theme.muted,
    },
  ];
  for (const sec of HOME_COMMAND_SECTIONS) {
    const c = theme[sec.themeKey];
    lines.push({ id: nextId(), text: sec.title, color: c, dim: false });
    for (const row of sec.rows) {
      lines.push({
        id: nextId(),
        text: `  ${row.cmd.padEnd(22)} ${row.hint}`,
        color: theme.description,
        dim: true,
      });
    }
  }
  lines.push({
    id: nextId(),
    text: 'REPL: help · clear · exit | chat = prod server + Ink; chat --dev = HMR',
    color: theme.muted,
  });
  return lines;
}

export function MagicbornHome(props: MagicbornHomeProps) {
  const { exit } = useApp();
  const theme = resolveCliTheme();
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

  const product = props.branding?.product ?? 'magicborn';
  const tagline =
    props.branding?.tagline ??
    'Operator CLI — type a command and press Enter (see `magicborn --help`).';
  const footnote =
    props.branding?.footnote ??
    'Site Copilot: `magicborn chat` (from home) · `magicborn --help`';

  const cols = Math.max(48, Math.min(100, (process.stdout.columns ?? 80) - 1));
  const rows = process.stdout.rows ?? 24;
  const [session, setSession] = useState<CliSessionV1>(() => readCliSession(props.repoRoot));
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const footerModel = session.chatModel?.trim() || process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini';
  const footerRag = formatRagModeLabel(session.ragMode);
  const footerFolder = path.basename(props.repoRoot);

  const persistSession = useCallback(
    (patch: Partial<CliSessionV1>) => {
      setSession(writeCliSessionMerge(props.repoRoot, patch));
    },
    [props.repoRoot],
  );

  const getSession = useCallback(() => sessionRef.current, []);
  const maxTranscriptLines = Math.max(4, rows - 26);

  const visibleTranscript = useMemo(
    () => transcript.slice(-maxTranscriptLines),
    [transcript, maxTranscriptLines],
  );

  const acceptEditsAuto = session.acceptEditsAuto === true;
  const acceptEditsEnvLocked = isAcceptEditsAutoEnvLocked();

  const handleAcceptEditsToggle = useCallback(() => {
    setSession(toggleAcceptEditsAuto(props.repoRoot, acceptEditsAuto));
  }, [props.repoRoot, acceptEditsAuto]);

  /** Rough chars/4 vs 128k window — until server-side tokenizer (**`global-tooling-04-05`**). */
  const approxContextPct = useMemo(() => {
    const chars = transcript.reduce((n, t) => n + t.text.length, 0);
    return approxContextPctFromChars(chars);
  }, [transcript]);

  const vendorUseSlashLines = useMemo(() => {
    try {
      return getVendorCompletionRows(props.repoRoot)
        .filter((r) => r.controllable)
        .map((r) => `/vendor use ${r.id}`)
        .sort((a, b) => a.localeCompare(b));
    } catch {
      return [];
    }
  }, [props.repoRoot]);

  const endSession = useCallback(
    (reason: HomeSessionEndReason) => {
      props.onSessionEnd(reason);
      exit();
    },
    [exit, props],
  );

  const appendLines = useCallback((next: TranscriptLine[]) => {
    setTranscript((prev) => [...prev, ...next]);
  }, []);

  const runLine = useCallback(
    (raw: string) => {
      const line = raw.trim();
      if (!line) return;

      appendLines([{ id: nextId(), text: `> ${line}`, color: theme.primary }]);

      if (parseSlashChatLine(line)) {
        void handleSlashChatLine({
          userLine: line,
          getSession,
          persistSession,
        }).then((r: { assistantText: string } | null) => {
          if (r) {
            appendLines([{ id: nextId(), text: r.assistantText, color: theme.muted }]);
          }
        });
        return;
      }

      const lower = line.toLowerCase();
      if (lower === 'help' || lower === '?' || lower === 'h') {
        appendLines(buildHelpTranscript(theme));
        return;
      }
      if (lower === 'clear') {
        setTranscript([]);
        return;
      }
      if (lower === 'exit' || lower === 'quit' || lower === ':q') {
        endSession('quit');
        return;
      }

      const argv = parseReplLine(line);
      if (argv.length === 0) return;

      if (argv[0] === 'chat' && argv.length === 1) {
        endSession('chat');
        return;
      }

      const { code, combined } = execMagicbornCliArgv(props.cliJs, props.repoRoot, argv);
      if (combined && combined.length > 0) {
        appendLines([{ id: nextId(), text: combined, color: code === 0 ? theme.muted : theme.error }]);
      } else if (code !== 0) {
        appendLines([{ id: nextId(), text: `(exit ${code})`, color: theme.warn }]);
      }
    },
    [appendLines, endSession, getSession, persistSession, props.cliJs, props.repoRoot, theme],
  );

  return (
    <Box flexDirection="column" width={cols}>
      <CliScreenBanner
        theme={theme}
        width={cols}
        headline={
          <Text bold color={theme.primary}>
            {product} <Text dimColor>v{props.cliVersion}</Text>
          </Text>
        }
      >
        <Text color={theme.muted}>{tagline}</Text>
        <Text color={theme.description}>cwd {shortenPath(props.repoRoot, cols - 6)}</Text>
        {footnote ? <Text dimColor>{footnote}</Text> : null}
      </CliScreenBanner>

      <Box flexDirection="column" marginBottom={1}>
        {HOME_COMMAND_SECTIONS.map((sec) => (
          <Box key={sec.id} flexDirection="column" marginBottom={1}>
            <Text bold underline color={theme[sec.themeKey]}>
              {sec.title}
            </Text>
            {sec.rows.map((row) => (
              <Box key={`${sec.id}-${row.cmd}`} flexDirection="row">
                <Box marginRight={1} width={28} flexShrink={0}>
                  <Text bold color={theme[sec.themeKey]}>
                    {row.cmd}
                  </Text>
                </Box>
                <Box flexGrow={1}>
                  <Text wrap="wrap" color={theme.description} dimColor>
                    {row.hint}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {visibleTranscript.length > 0 ? (
        <Box flexDirection="column" marginBottom={1} borderStyle="single" borderColor={theme.border} paddingX={1}>
          <Text underline color={theme.muted}>
            Session
          </Text>
          {visibleTranscript.map((t) => (
            <Text key={t.id} color={t.color} dimColor={t.dim} wrap="wrap">
              {t.text}
            </Text>
          ))}
        </Box>
      ) : null}

      <ReplLineInput
        borderColor={theme.border}
        promptColor={theme.primary}
        slashPaletteColor={theme.slash}
        mutedColor={theme.muted}
        slashExtraLines={vendorUseSlashLines}
        placeholder="command…"
        onExitRequest={() => endSession('quit')}
        onSubmit={runLine}
        onAcceptEditsToggle={acceptEditsEnvLocked ? undefined : handleAcceptEditsToggle}
      />

      <CliFooterSlotRow
        theme={theme}
        width={cols}
        slots={[
          <Text key="hint" color={theme.asset}>
            ↑ /rag
          </Text>,
          <Text key="model" color={theme.model}>
            {footerModel} · {footerRag}
          </Text>,
          <Text key="cwd" color={theme.muted}>
            {footerFolder}
          </Text>,
        ]}
      />

      <Box flexDirection="row" width={cols} justifyContent="space-between" marginTop={0}>
        <CliContextMeter theme={theme} width={Math.max(40, cols - 36)} usedPct={approxContextPct} />
        <Text color={theme.description} dimColor>
          » accept edits · {acceptEditsAuto ? 'auto' : 'confirm'}
          {acceptEditsEnvLocked ? ' (env)' : ''}
        </Text>
      </Box>
    </Box>
  );
}
