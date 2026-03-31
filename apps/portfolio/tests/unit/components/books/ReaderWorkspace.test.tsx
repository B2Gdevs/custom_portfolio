// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { ReaderWorkspace } from '@portfolio/repub-builder/reader';
import type { ReaderBookEntry } from '@portfolio/repub-builder/reader';

function TestLink(props: ComponentProps<'a'>) {
  return <a {...props} />;
}

describe('ReaderWorkspace', () => {
  it('uses the host toolbar slot and does not render a duplicate reader menu button', () => {
    render(
      <ReaderWorkspace
        books={[
          {
            slug: 'mordreds_tale',
            title: "Mordred's Tale",
            author: 'Ben Garrard',
            hasEpub: true,
            genres: ['Dark fantasy'],
          },
        ]}
        ReaderLink={TestLink}
        readerToolbarStart={<button type="button">Portfolio sidebar</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Portfolio sidebar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open reader menu' })).not.toBeInTheDocument();
  });

  it('keeps built-in, queued, and saved-upload books visible without the removed shelf sections', () => {
    const books: ReaderBookEntry[] = [
      {
        slug: 'mordreds_tale',
        title: "Mordred's Tale",
        author: 'Ben Garrard',
        hasEpub: true,
        genres: ['Dark fantasy'],
      },
      {
        slug: 'magicborn_rune_path',
        title: 'Magicborn: The Rune Path',
        author: 'Ben Garrard',
        hasEpub: false,
        genres: ['Epic fantasy'],
      },
      {
        slug: 'uploaded-record-library-1',
        recordId: 'library-1',
        title: 'Uploaded EPUB',
        author: 'Ben Garrard',
        hasEpub: true,
        sourceKind: 'uploaded',
        remoteEpubUrl: '/api/media/file/uploaded.epub',
        genres: ['Private upload'],
      },
    ];

    render(<ReaderWorkspace books={books} ReaderLink={TestLink} />);

    expect(screen.getAllByText("Mordred's Tale").length).toBeGreaterThan(0);
    expect(screen.getAllByText('Magicborn: The Rune Path').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Saved uploads' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Library editions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Coming soon' })).not.toBeInTheDocument();
  });
});
