import { NavLink } from 'react-router-dom';
import { Clapperboard, LayoutDashboard, Lightbulb, Plus, Settings, X } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'My Reels', icon: Clapperboard, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900',
          'lg:z-30 lg:w-64 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-2 pt-2">
          <NavLink
            to="/projects/new"
            onClick={onClose}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            <Plus className="h-4 w-4" /> New Reel
          </NavLink>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="m-4 rounded-xl bg-gradient-to-br from-brand-50 to-fuchsia-50 p-4 dark:from-brand-500/10 dark:to-fuchsia-500/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Quick tip
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            The first 2 seconds decide if people keep watching. Lead with your strongest line.
          </p>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className={cn('mr-1.5 inline-block h-2 w-2 rounded-full', isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500')} />
          {isSupabaseConfigured ? 'Connected to Supabase' : 'Demo mode (saved in this browser)'}
        </div>
      </aside>
    </>
  );
}
