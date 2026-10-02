import { useNavigate } from 'react-router-dom';
import { Database, Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { PageHeader } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useConfirm } from '@/context/ConfirmContext';
import { useTheme, type Theme } from '@/context/ThemeContext';
import { resetDemoData } from '@/lib/projectService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const confirm = useConfirm();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Personalize the app and check how your data is stored." />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Appearance" description="Choose how AI Reel Builder looks to you." />
          <CardBody>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors',
                    theme === value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-300',
                  )}
                  aria-pressed={theme === value}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader icon={<Database className="h-4 w-4" />} title="Data storage" />
          <CardBody className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            {isSupabaseConfigured ? (
              <p>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Connected to Supabase. Your Reels are saved to your database and available on any device.
              </p>
            ) : (
              <>
                <p>
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-500" />
                  <strong>Demo mode.</strong> Your Reels are saved in this browser only. Add your Supabase keys to a{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">.env.local</code> file to save
                  them online (see the README).
                </p>
                <Button
                  variant="secondary"
                  icon={<RotateCcw className="h-4 w-4" />}
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Reset sample data?',
                      message: 'All Reels saved in this browser will be replaced with the 4 sample Reels.',
                      confirmLabel: 'Reset',
                      danger: true,
                    });
                    if (ok) {
                      resetDemoData();
                      navigate('/');
                    }
                  }}
                >
                  Reset sample data
                </Button>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
