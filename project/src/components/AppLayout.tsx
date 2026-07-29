import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, FileText, Mic, Building2, Map, User,
  LogOut, Moon, Sun, Menu, X, Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/interview/setup', label: 'New Interview', icon: Mic },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/profile', label: 'Profile', icon: User },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userName = (user?.user_metadata as any)?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 z-30">
        <div className="px-5 py-5 border-b border-ink-200 dark:border-ink-800">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-200 dark:border-ink-800">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">{userName}</p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 transition-colors">
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="btn-ghost p-2" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80%] bg-white dark:bg-ink-900 flex flex-col animate-fade-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200 dark:border-ink-800">
              <Logo size="sm" />
              <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
                    }`}>
                  <Icon className="h-5 w-5" /> {label}
                </NavLink>
              ))}
            </nav>
            <div className="p-3 border-t border-ink-200 dark:border-ink-800">
              <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
                <LogOut className="h-5 w-5" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop top bar */}
        <header className="hidden lg:flex sticky top-0 z-20 items-center justify-between px-8 py-4 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md border-b border-ink-200 dark:border-ink-800">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <span>AI-powered interview preparation</span>
          </div>
          <button onClick={toggle} className="btn-ghost p-2" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>
        <main className="px-4 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
