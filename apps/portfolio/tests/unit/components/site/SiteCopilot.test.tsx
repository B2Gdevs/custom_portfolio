// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { SiteCopilot } from '@/components/site/SiteCopilot';
import { SiteCopilotProvider } from '@/components/site/SiteCopilotContext';

function renderWithProvider(ui: ReactElement) {
  return render(<SiteCopilotProvider>{ui}</SiteCopilotProvider>);
}

describe('SiteCopilot', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the assistant-ui launcher and opens the chat dialog', async () => {
    renderWithProvider(<SiteCopilot />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Chat' }));

    expect(await screen.findByRole('dialog', { name: 'Chat' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Type a message...' })).toBeInTheDocument();
    expect(screen.getByText('Site search · assistant')).toBeInTheDocument();
  });
});
