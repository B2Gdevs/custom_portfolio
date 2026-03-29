'use client';

export function RequiredSectionsNotice({
  type,
  missing,
}: {
  type: 'blog' | 'projects';
  missing: string[];
}) {
  if (missing.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <p className="font-medium">
        This {type === 'blog' ? 'article' : 'project page'} is still missing the full structured template.
      </p>
      <p className="mt-1 text-amber-100/80">
        Missing sections: {missing.join(', ')}.
      </p>
    </div>
  );
}
