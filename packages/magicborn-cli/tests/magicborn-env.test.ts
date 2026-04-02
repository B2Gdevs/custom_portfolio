import { describe, expect, it } from 'vitest';
import { redactEnvDisplayValue } from '../src/magicborn-env.ts';

describe('magicborn-env', () => {
  it('redacts obvious secrets', () => {
    expect(redactEnvDisplayValue('OPENAI_API_KEY', 'sk-abc')).toContain('redacted');
    expect(redactEnvDisplayValue('DATABASE_URL', 'postgres://x')).toBe('postgres://x');
  });

  it('truncates long non-secret values', () => {
    const long = 'x'.repeat(200);
    expect(redactEnvDisplayValue('FOO', long).length).toBeLessThan(long.length);
  });
});
