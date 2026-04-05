// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DiscoveryTagButton } from '@/components/content/DiscoveryTagButton';

describe('DiscoveryTagButton', () => {
  it('calls onClick and applies activeAccentClass when active', () => {
    const onClick = vi.fn();

    const { rerender } = render(
      <DiscoveryTagButton active={false} onClick={onClick}>
        Filter
      </DiscoveryTagButton>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Filter' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <DiscoveryTagButton active={true} onClick={onClick} activeAccentClass="text-[#d6a379]">
        Filter
      </DiscoveryTagButton>
    );

    const btn = screen.getByRole('button', { name: 'Filter' });
    expect(btn.className).toContain('text-[#d6a379]');
  });
});
