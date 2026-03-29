'use client';

export function ReaderEmptyCover({ title }: { title: string }) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'EB';

  return (
    <div className="relative flex h-full w-full overflow-hidden rounded-[1.4rem] border border-[rgba(140,102,67,0.2)] bg-[linear-gradient(180deg,rgba(214,176,129,0.18),rgba(39,24,16,0.92))] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="absolute inset-x-0 top-0 h-12 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),transparent)]" />
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-[rgba(250,229,207,0.64)]">
          Empty
        </div>
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] font-display text-xl text-[#f4e7d7]">
            {initials}
          </div>
          <div>
            <div className="line-clamp-3 font-display text-xl leading-tight text-[#fff2e3]">
              {title}
            </div>
            <div className="mt-2 text-[0.68rem] uppercase tracking-[0.24em] text-[rgba(250,229,207,0.58)]">
              Reader edition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
