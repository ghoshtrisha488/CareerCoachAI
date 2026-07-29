import { Link } from 'react-router-dom';

export function Logo({ to = '/', size = 'md' }: { to?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-9 w-9';
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <div className={`${dims} rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft transition-transform group-hover:scale-105`}>
        <svg viewBox="0 0 32 32" className="h-1/2 w-1/2" fill="none">
          <path d="M8 10h16M8 16h10M8 22h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="22" r="3" fill="#5eead4" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>
      <span className={`${text} font-display font-bold tracking-tight text-ink-900 dark:text-white`}>
        Interview<span className="text-brand-600 dark:text-brand-400">Coach</span>
      </span>
    </Link>
  );
}
