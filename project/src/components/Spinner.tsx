import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-ink-50 dark:bg-ink-950">
      <Spinner className="h-8 w-8 text-brand-600" />
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}
