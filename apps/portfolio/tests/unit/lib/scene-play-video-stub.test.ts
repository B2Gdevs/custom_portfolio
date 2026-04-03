import { describe, expect, it } from 'vitest';
import {
  composeScenePlayVideoPromptStub,
  validateVideoPromptStub,
} from '@/lib/magicborn/scene-play-video-stub';

describe('scene play video stub', () => {
  it('composes and validates', () => {
    expect(composeScenePlayVideoPromptStub('Beat: door opens.', 'Noir')).toContain('Beat: door opens');
    expect(composeScenePlayVideoPromptStub('Beat: door opens.', 'Noir')).toContain('Noir');
    expect(validateVideoPromptStub('x')).toEqual({ ok: true });
    expect(validateVideoPromptStub('')).toEqual({ ok: false, reason: 'empty' });
  });

  it('rejects empty scene play', () => {
    expect(() => composeScenePlayVideoPromptStub('  ')).toThrow();
  });
});
