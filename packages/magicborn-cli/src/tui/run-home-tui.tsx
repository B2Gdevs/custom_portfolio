import React from 'react';
import { render } from 'ink';
import { MagicbornHome } from './MagicbornHome.js';

export async function runMagicbornHomeTui(): Promise<void> {
  const { waitUntilExit } = render(<MagicbornHome />);
  await waitUntilExit();
}
