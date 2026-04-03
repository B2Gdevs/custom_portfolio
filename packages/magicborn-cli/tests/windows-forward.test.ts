import { describe, expect, it } from 'vitest';
import { buildCmdCdExecLine, buildMsysBashCdExecScript } from '@magicborn/mb-cli-framework';

describe('buildMsysBashCdExecScript', () => {
  it('builds cd && exec lines', () => {
    expect(buildMsysBashCdExecScript('/c/r', 'claude', [])).toBe("cd '/c/r' && exec claude");
    expect(buildMsysBashCdExecScript('/c/r', 'claude', ['--help'])).toBe(
      "cd '/c/r' && exec claude '--help'",
    );
  });
});

describe('buildCmdCdExecLine', () => {
  it('builds cmd.exe /c lines with cmd quoting', () => {
    expect(buildCmdCdExecLine('C:\\Users\\x\\repo', 'claude', [])).toBe(
      'cd /d "C:\\Users\\x\\repo" && claude',
    );
    expect(buildCmdCdExecLine('C:\\r', 'claude', ['--help'])).toBe(
      'cd /d "C:\\r" && claude "--help"',
    );
    expect(buildCmdCdExecLine('C:\\r', 'claude', ['a"b'])).toBe(
      'cd /d "C:\\r" && claude "a""b"',
    );
  });
});
