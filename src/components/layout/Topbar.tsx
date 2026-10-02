import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/layout/Logo';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { resolvedTheme, toggle } = useTheme();
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
      <button
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="lg:hidden">
        <Logo />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
