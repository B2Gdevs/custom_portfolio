/**
 * Clipboard / drop files often have missing or wrong MIME types (especially on Windows).
 * tldraw rejects files with an empty `type` in notifyIfFileNotAllowed.
 */
export function normalizeImageFileForTldraw(file: File): File {
  const type =
    file.type && file.type.startsWith('image/')
      ? file.type
      : 'image/png';
  const blob = file.slice(0, file.size, type);
  return new File([blob], file.name || 'pasted.png', {
    type,
    lastModified: file.lastModified,
  });
}
