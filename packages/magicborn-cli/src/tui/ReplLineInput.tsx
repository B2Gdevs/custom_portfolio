import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import {
  applyTabCompletion,
  completionGhostAfter,
  mergeSlashPalette,
} from './repl-completion.js';

export type ReplLineInputProps = {
  placeholder?: string;
  borderColor: string;
  /** Prompt `> ` and typed line (not the `/` palette — use **`slashPaletteColor`**). */
  promptColor: string;
  /** `/` palette title + selected row; defaults to **`promptColor`**. */
  slashPaletteColor?: string;
  mutedColor: string;
  /** Prepended to `/` palette (e.g. `/vendor use <id>` for controllable vendors). */
  slashExtraLines?: readonly string[];
  onSubmit: (line: string) => void;
  onExitRequest: () => void;
  /** When set, **Ctrl+E** on an **empty** line toggles accept-edits session prefs (does not insert `e`). */
  onAcceptEditsToggle?: () => void;
};

function isTabKey(input: string, key: { tab?: boolean }): boolean {
  return Boolean(key.tab) || input === '\t';
}

function normLine(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

const SLASH_PALETTE_LIMIT = 14;

/** Single-column caret (thinner than inverse space block). */
const CARET_CHAR = '\u258f';

/**
 * Single-line stdin via `useInput` so Esc / q / Ctrl+C can quit when the line is empty
 * (unlike `ink-text-input`, which swallows global shortcuts while focused).
 */
export function ReplLineInput(props: ReplLineInputProps) {
  const [value, setValue] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const ghost = useMemo(() => completionGhostAfter(value), [value]);
  const slashHints = useMemo(
    () => mergeSlashPalette(value, props.slashExtraLines ?? [], 80, SLASH_PALETTE_LIMIT),
    [value, props.slashExtraLines],
  );

  useEffect(() => {
    setSlashIndex(0);
  }, [slashHints.join('\n')]);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      props.onExitRequest();
      return;
    }
    if (key.escape) {
      if (value.length === 0) {
        props.onExitRequest();
      } else {
        setValue('');
      }
      return;
    }
    if (value.length === 0 && (input === 'q' || input === 'Q') && !key.ctrl && !key.meta) {
      props.onExitRequest();
      return;
    }
    if (key.return) {
      const paletteOpen = value.startsWith('/') && slashHints.length > 0;
      if (paletteOpen) {
        const pick = slashHints[slashIndex] ?? slashHints[0]!;
        const pickNorm = normLine(pick);
        const valNorm = normLine(value);
        if (valNorm === pickNorm) {
          props.onSubmit(value.trim());
          setValue('');
          return;
        }
        const filled = pick.endsWith(' ') ? pick : `${pick.trimEnd()} `;
        setValue(filled);
        return;
      }
      props.onSubmit(value);
      setValue('');
      return;
    }
    if (isTabKey(input, key)) {
      const next = applyTabCompletion(value);
      if (next) {
        setValue(next);
      }
      return;
    }
    if (key.backspace || key.delete) {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (key.upArrow) {
      if (slashHints.length > 0) {
        setSlashIndex((i) => Math.max(0, i - 1));
      }
      return;
    }
    if (key.downArrow) {
      if (slashHints.length > 0) {
        setSlashIndex((i) => Math.min(slashHints.length - 1, i + 1));
      }
      return;
    }
    if (key.leftArrow || key.rightArrow) {
      return;
    }
    if (key.ctrl && input === 'u') {
      setValue('');
      return;
    }
    if (key.ctrl && input === 'e') {
      if (value.length === 0 && props.onAcceptEditsToggle) {
        props.onAcceptEditsToggle();
        return;
      }
    }
    if (input && !key.ctrl && !key.meta) {
      setValue((v) => v + input);
    }
  });

  const dimGhost = ghost ?? '';
  const slashAccent = props.slashPaletteColor ?? props.promptColor;

  const caret = <Text inverse>{CARET_CHAR}</Text>;

  return (
    <Box flexDirection="column" marginTop={1}>
      {slashHints.length > 0 ? (
        <Box flexDirection="column" marginBottom={1} borderStyle="single" borderColor={props.borderColor} paddingX={1}>
          <Text bold underline color={slashAccent}>
            / actions
          </Text>
          {slashHints.map((line, i) => {
            const selected = i === slashIndex;
            return (
              <Text
                key={`${line}-${i}`}
                bold={selected}
                color={selected ? slashAccent : props.mutedColor}
                dimColor={!selected}
                wrap="wrap"
              >
                {selected ? '› ' : '  '}
                {line}
              </Text>
            );
          })}
        </Box>
      ) : null}
      <Box borderStyle="round" borderColor={props.borderColor} paddingX={1}>
        <Text color={props.promptColor}>{'> '}</Text>
        <Text>
          {value.length > 0 ? (
            <>
              {value}
              {caret}
              {dimGhost ? <Text color={props.mutedColor}>{dimGhost}</Text> : null}
            </>
          ) : (
            <>
              {caret}
              {props.placeholder ? <Text color={props.mutedColor}>{props.placeholder}</Text> : null}
            </>
          )}
        </Text>
      </Box>
      <Text color={props.mutedColor}>
        {props.onAcceptEditsToggle
          ? '↑↓ pick · Enter apply or run · Tab completes · Ctrl+U clear · Ctrl+E accept edits (empty line) · Esc/q empty quits · Ctrl+C quits'
          : '↑↓ pick · Enter apply or run · Tab completes · Ctrl+U clear · Esc/q empty quits · Ctrl+C quits'}
      </Text>
    </Box>
  );
}
