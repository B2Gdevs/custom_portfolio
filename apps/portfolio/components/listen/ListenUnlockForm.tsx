'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ListenUnlockForm({ lockGroup }: { lockGroup: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch('/api/listen/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: lockGroup, password }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        if (data.error === 'invalid_password') {
          setError('Wrong password.');
        } else if (data.error === 'not_configured') {
          setError('Unlock is not configured for this deployment.');
        } else {
          setError('Could not unlock. Try again.');
        }
        return;
      }
      setPassword('');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-2xl border border-border/60 bg-black/25 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Shared access</p>
      <p className="text-sm text-text-muted">Enter the password for this group to reveal embeds and BandLab links.</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="password"
          name="listen-unlock-password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-10 rounded-xl border-border/80 bg-dark-alt/80"
          disabled={pending}
        />
        <Button type="submit" className="h-10 rounded-xl" disabled={pending}>
          {pending ? 'Checking…' : 'Unlock'}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
