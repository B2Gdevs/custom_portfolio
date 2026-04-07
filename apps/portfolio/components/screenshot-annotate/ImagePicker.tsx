'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

/** Sync snapshot so async reads (tldraw load) do not hit empty clipboard blobs. */
function stabilizeImageFile(file: File): File {
  const type =
    file.type && file.type.startsWith('image/')
      ? file.type
      : 'image/png';
  const blob = file.slice(0, file.size, type);
  return new File([blob], file.name || 'pasted.png', { type });
}

const CLIPBOARD_IMAGE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

async function filesFromClipboardApi(items: ClipboardItem[]): Promise<File[]> {
  const out: File[] = [];
  for (const item of items) {
    for (const mime of CLIPBOARD_IMAGE_MIMES) {
      if (!item.types.includes(mime)) continue;
      const blob = await item.getType(mime);
      const ext = mime.split('/')[1] ?? 'png';
      out.push(new File([blob], `paste.${ext}`, { type: mime }));
      break;
    }
  }
  return out;
}

/**
 * Read images from the paste event's DataTransfer (tldraw-style fallbacks).
 * Prefer matching `item.type` (image/*) + getAsFile — not only `kind === 'file'`.
 */
function readClipboardImageFilesFromEvent(e: ClipboardEvent): File[] {
  const items = e.clipboardData?.items;
  if (!items) return [];
  const out: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.type.startsWith('image/')) continue;
    const f = item.getAsFile();
    if (!f || f.size === 0) continue;
    const type = f.type.startsWith('image/') ? f.type : item.type;
    if (!type.startsWith('image/')) continue;
    out.push(new File([f], f.name || 'paste.png', { type }));
  }
  return out;
}

export function ImagePicker({ onChooseImage }: { onChooseImage: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = useCallback(
    (file: File) => {
      if (!isImageFile(file)) {
        setError('Choose an image file (PNG, JPEG, WebP, …).');
        return;
      }
      setError(null);
      onChooseImage(file);
    },
    [onChooseImage],
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      const fallbackFiles = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith('image/'),
      );
      const syncFiles = readClipboardImageFilesFromEvent(e);

      const take = (file: File) => {
        acceptFile(stabilizeImageFile(file));
      };

      // Match tldraw: Clipboard API first (reliable on Windows/Chrome for screenshots),
      // then event.files, then DataTransferItem list.
      if (navigator.clipboard?.read) {
        e.preventDefault();
        navigator.clipboard
          .read()
          .then(async (clipboardItems) => {
            const fromApi = await filesFromClipboardApi(clipboardItems);
            if (fromApi.length) {
              take(fromApi[0]);
              return;
            }
            if (fallbackFiles.length) take(fallbackFiles[0]);
            else if (syncFiles.length) take(syncFiles[0]);
          })
          .catch(() => {
            if (fallbackFiles.length) take(fallbackFiles[0]);
            else if (syncFiles.length) take(syncFiles[0]);
          });
        return;
      }

      if (fallbackFiles.length || syncFiles.length) {
        e.preventDefault();
        if (fallbackFiles.length) take(fallbackFiles[0]);
        else take(syncFiles[0]);
      }
    },
    [acceptFile],
  );

  useEffect(() => {
    const el = zoneRef.current;
    if (!el) return;
    el.addEventListener('paste', onPaste);
    return () => el.removeEventListener('paste', onPaste);
  }, [onPaste]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <h1 className="font-display text-2xl text-primary md:text-3xl">Screenshot annotate</h1>
        <p className="mt-2 text-sm text-text-muted">
          Drop an image, paste from the clipboard, or import a file. Everything stays in this browser tab.
        </p>
        <div
          ref={zoneRef}
          tabIndex={0}
          role="button"
          aria-label="Image drop zone. Click to focus, then paste an image."
          onClick={() => zoneRef.current?.focus()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') zoneRef.current?.focus();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const f = e.dataTransfer.files?.[0];
            if (f) acceptFile(f);
          }}
          className={`mt-8 flex min-h-[220px] cursor-default flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            dragActive ? 'border-accent bg-dark-alt/80' : 'border-border bg-dark-alt/40'
          }`}
        >
          <p className="text-sm text-text-muted">
            Drop an image here, or <strong className="text-primary">click this area</strong> and press{' '}
            <kbd className="rounded border border-border px-1 py-0.5 font-mono text-xs">Ctrl+V</kbd> /{' '}
            <kbd className="rounded border border-border px-1 py-0.5 font-mono text-xs">⌘V</kbd> to paste.
          </p>
          <button
            type="button"
            className="mt-6 rounded-full border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
            onClick={() => inputRef.current?.click()}
          >
            Import image…
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) acceptFile(f);
              e.target.value = '';
            }}
          />
        </div>
        {error ? <p className="mt-3 text-sm text-amber-400">{error}</p> : null}
      </div>
    </div>
  );
}
