'use client';

import {
  AssistantRuntimeProvider,
  type ChatModelRunOptions,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  useLocalRuntime,
  useMessagePartText,
} from '@assistant-ui/react';
import { ArrowUp, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type DemoStep = {
  id: string;
  label: string;
  userText: string;
};

const STEPS: DemoStep[] = [
  {
    id: 'cp1-task',
    label: 'CP1 — Which task after Ch1?',
    userText:
      '[CP1 · Rune Path] Ch1 is on the page. `mrp-outline-01-02` is done. What is the next single task id for planning Act I continuation?',
  },
  {
    id: 'cp1-trigger',
    label: "CP1 — Escape trigger with Ch1's ending",
    userText:
      '[CP1 · Rune Path] Ch1 ends with Kael wanting a mark that is his. I need an escape trigger that breaks Host compliance without a cheap paperwork glitch. What fits the decisions we already locked?',
  },
  {
    id: 'cp1-registry',
    label: 'CP1 — Lock beats + open Ch2',
    userText:
      '[CP1 · Rune Path] We added an Act I beat table and forward questions to state. We created `02-chapter-2-the-breach/01.md`. How should task-registry rows move?',
  },
  {
    id: 'cp1-article',
    label: 'CP1 — Record it in the article',
    userText:
      '[CP1 · Rune Path] Where do we put planning snapshots, manuscript proof, and this conversation for readers following along?',
  },
];

const RESPONSES: Record<DemoStep['id'], string> = {
  'cp1-task': [
    '**Next id:** **`mrp-outline-01-03`** — Act I beat sheet from post–Ch1 through first Path waypoint.',
    '',
    '**Verify** on that row: **`state.mdx`** gains a concrete **Act I beat sheet** (Ch2–4 or until first waypoint), aligned with [`MRP-PREQUEL-END`](/docs/books/magicborn-rune-path/planning/decisions), [`MRP-CONCEIT`](/docs/books/magicborn-rune-path/planning/decisions), and [`MRP-DUNGEON-RELIC-LAW`](/docs/books/magicborn-rune-path/planning/decisions).',
    '',
    'Do **not** draft Ch2 as the same task unless you explicitly widen scope; after `01-03` is **done**, **`mrp-draft-01-01`** owns Ch2 prose.',
  ].join('\n'),

  'cp1-trigger': [
    '**Fit:** use **institutional horror** you already earned — Ch1 shows armory **closure**, relic weight, and **counting objects more carefully than boys**.',
    '',
    '**Suggestion (locked in our pass):** a **public reckoning** for a relic / return breach that Kael reads as **policy**, not justice — so compliance breaks in daylight, not in a private pardon plot. That hands Ch2 a clean title beat: *The Breach*.',
    '',
    '**Ch3–4:** pursuit → first **latent** carve / partial syllable → first **waypoint** with a cost (trust, labor, secret). Keep **Legacy** Kael at 42 plausible — no final safety here.',
  ].join('\n'),

  'cp1-registry': [
    '**Moves:**',
    '- `mrp-outline-01-03` → **`done`** once the beat sheet + forward questions are on [state](/docs/books/magicborn-rune-path/planning/state).',
    '- `mrp-draft-01-01` → **`in-progress`** when Ch2 scaffold + first page exist.',
    '',
    '**Registry `updated` + `state` status** line should mention Ch2 opened. **Maintainers** verify with `pnpm run build:books` before merging; **readers of this tutorial** use the **shipped EPUB** and frozen checkpoint files below—no local build required.',
  ].join('\n'),

  'cp1-article': [
    '**In this article** under **Walkthrough → Checkpoints**: one subsection per cycle — **Planning (outcomes)** with excerpts or `CopyMarkdownSample`, **Implementation (outcomes)** with file paths + reader links, **Conversation showcase** (this scripted thread).',
    '',
    '**Planning pack:** open **Resources** on this page → planning pack modal → **Site** export includes `books/magicborn-rune-path/planning/*.mdx` mirrors for download.',
    '',
    '**Reader:** open the **Walkthrough** tab — **Checkpoint 1** embed uses the **frozen** `cp01` EPUB; **latest** manuscript stays on the canonical slug.',
  ].join('\n'),
};

function joinUserText(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  return content
    .map((part: { type?: string; text?: string }) =>
      part?.type === 'text' && typeof part.text === 'string' ? part.text : '',
    )
    .join('')
    .trim();
}

function lastUserQuery(messages: readonly { role?: string; content?: unknown }[] | undefined): string {
  if (!messages?.length) return '';
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m?.role === 'user') {
      const t = joinUserText(m.content);
      if (t) return t;
    }
  }
  return '';
}

function responseForUserQuery(query: string): string {
  const step = STEPS.find((s) => s.userText === query);
  if (step) return RESPONSES[step.id];
  return 'This demo only recognizes the four **Checkpoint 1** prompts. Reset and use the labeled buttons—free typing is disabled.';
}

function DemoMarkdownTextPart() {
  const part = useMessagePartText();
  const isUser = useAuiState((s) => s.message.role === 'user');
  const raw = part.text ?? '';

  return (
    <div
      className={cn(
        'max-w-none text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5',
        isUser
          ? 'text-white [&_a]:text-amber-100 [&_a]:underline [&_code]:rounded [&_code]:bg-white/15 [&_code]:px-1 [&_code]:text-[0.9em]'
          : 'text-[#201b18] dark:text-[#f3eee5] [&_a]:text-[#ae5630] dark:[&_a]:text-[#e8b896] [&_a]:underline [&_code]:rounded [&_code]:border [&_code]:border-[#ded9cf] dark:[&_code]:border-[#3a372f] [&_code]:bg-[#f7f4ee] dark:[&_code]:bg-[#2a2723] [&_code]:px-1 [&_code]:text-[0.9em]',
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{raw}</ReactMarkdown>
    </div>
  );
}

function DemoMessages() {
  const isUser = useAuiState((s) => s.message.role === 'user');

  return (
    <MessagePrimitive.Root
      className={`mb-4 flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={cn(
            'rounded-[1.75rem] border px-4 py-3 shadow-sm',
            isUser
              ? 'border-[#d8a46e] bg-[#ae5630] text-white'
              : 'border-[#ded9cf] bg-white/95 text-[#201b18] dark:border-[#3a372f] dark:bg-[#1f1e1b] dark:text-[#f3eee5]',
          )}
        >
          <MessagePrimitive.Parts
            components={{
              Text: DemoMarkdownTextPart,
            }}
          />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
}

function DemoComposer() {
  return (
    <ComposerPrimitive.Root className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-[1.75rem] border border-[#ded9cf] bg-white/96 p-3 opacity-90 shadow-[0_24px_80px_rgba(39,28,18,0.12)] dark:border-[#39342d] dark:bg-[#1f1e1b]/96">
      <ComposerPrimitive.Input
        readOnly
        disabled
        aria-label="Composer (read-only in tutorial)"
        placeholder="Use suggested prompts below — typing is disabled in this walkthrough."
        className="min-h-24 w-full cursor-not-allowed resize-none bg-transparent px-2 py-1 font-serif text-base leading-7 text-[#1d1815] outline-none placeholder:text-[#8f8376] dark:text-[#f3eee5] dark:placeholder:text-[#92887c]"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ddd3c8] text-[#77685d] opacity-40 dark:border-[#3b362f] dark:text-[#d3c8ba]"
          >
            <Plus className="h-4 w-4" />
          </span>
          <span className="text-xs uppercase tracking-[0.24em] text-[#8b7c6f] dark:text-[#b7aea3]">
            Tutorial — scripted only
          </span>
        </div>
        <ComposerPrimitive.Send
          disabled
          aria-label="Send (disabled)"
          className="pointer-events-none inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ae5630]/40 text-white opacity-50"
        >
          <ArrowUp className="h-4 w-4" />
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
}

function DemoChips({ sessionId }: { sessionId: number }) {
  const aui = useAui();
  const messageCount = useAuiState((s) => s.thread.messages.length);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const [used, setUsed] = useState<Set<string>>(() => new Set());

  const sendStep = useCallback(
    (index: number) => {
      const step = STEPS[index];
      if (!step || used.has(step.id)) return;
      if (messageCount < index * 2) return;
      setUsed((prev) => new Set(prev).add(step.id));
      aui.thread().append(step.userText);
    },
    [aui, messageCount, used],
  );

  return (
    <div className="flex flex-col gap-2 border-t border-[#ddd3c5] bg-dark-alt/30 px-3 py-3 dark:border-border/70">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">
        Suggested prompts · session {sessionId + 1}
      </p>
      <div className="flex flex-wrap gap-2">
        {STEPS.map((step, index) => {
          const unlocked = messageCount >= index * 2;
          const done = used.has(step.id);
          const disabled = done || !unlocked || isRunning;
          return (
            <button
              key={step.id}
              type="button"
              disabled={disabled}
              title={
                !unlocked
                  ? 'Complete the previous step first'
                  : done
                    ? 'Already used'
                    : step.label
              }
              onClick={() => sendStep(index)}
              className={cn(
                'rounded-xl border px-3 py-2 text-left text-xs font-medium transition',
                disabled
                  ? 'cursor-not-allowed border-border/50 bg-dark-alt/30 text-text-muted/60'
                  : 'border-accent/40 bg-dark-alt/70 text-primary hover:border-accent hover:bg-dark-alt',
              )}
            >
              {step.label}
            </button>
          );
        })}
      </div>
      <p className="text-[0.7rem] leading-5 text-text-muted">
        <strong>Rune Path · Checkpoint 1.</strong> No model and no free text—each button sends one fixed prompt; replies are canned for the tutorial.
      </p>
    </div>
  );
}

function FictionLoopDemoInner({
  sessionId,
  onReset,
}: {
  sessionId: number;
  onReset: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#d9cfbf] bg-[#f4efe6] shadow-[0_28px_90px_rgba(24,18,13,0.24)] dark:border-[#343029] dark:bg-[#26231f]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ddd3c5] px-5 py-4 dark:border-[#3b362f]">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#8b7b6d] dark:text-[#b2a899]">
            Assistant UI · tutorial
          </p>
          <h3 className="mt-1 font-serif text-xl text-[#1d1815] dark:text-[#f3eee5]">
            Conversation showcase — <em>The Rune Path</em>
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[#ddd3c5] px-3 py-2 text-xs font-medium text-[#6f6155] transition hover:bg-[#ede5d8] dark:border-[#3b362f] dark:text-[#d4c8ba] dark:hover:bg-[#302b25]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset demo
        </button>
      </header>

      <div className="bg-[radial-gradient(circle_at_top,#fffaf1_0%,#f4efe6_55%,#ece4d7_100%)] px-4 pb-4 pt-5 dark:bg-[radial-gradient(circle_at_top,#37312a_0%,#26231f_56%,#1e1b17_100%)] sm:px-5">
        <ThreadPrimitive.Root className="flex max-h-[min(36rem,60vh)] min-h-[16rem] flex-col">
          <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto px-1">
            <ThreadPrimitive.Empty>
              <p className="px-2 text-center text-sm text-[#6f665f] dark:text-[#c7beb1]">
                Tap a <strong>suggested prompt</strong> below. Messages render as markdown; the composer matches the site chat but stays read-only here.
              </p>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages>{() => <DemoMessages />}</ThreadPrimitive.Messages>
          </ThreadPrimitive.Viewport>
          <div className="pt-4">
            <DemoComposer />
          </div>
          <DemoChips sessionId={sessionId} />
        </ThreadPrimitive.Root>
      </div>
    </div>
  );
}

function FictionLoopDemoSession({
  sessionId,
  onReset,
}: {
  sessionId: number;
  onReset: () => void;
}) {
  const run = useCallback(async ({ messages = [] }: ChatModelRunOptions) => {
    const query = lastUserQuery(messages);
    const text = responseForUserQuery(query);

    return {
      content: [{ type: 'text' as const, text }],
      status: { type: 'complete' as const, reason: 'stop' as const },
    };
  }, []);

  const runtime = useLocalRuntime({ run }, {});

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <FictionLoopDemoInner sessionId={sessionId} onReset={onReset} />
    </AssistantRuntimeProvider>
  );
}

export function FictionLoopDemo() {
  const [sessionId, setSessionId] = useState(0);

  return (
    <FictionLoopDemoSession
      key={sessionId}
      sessionId={sessionId}
      onReset={() => setSessionId((s) => s + 1)}
    />
  );
}
