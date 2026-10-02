import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function StepFooter({ onBack, children }: { onBack?: () => void; children?: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <div>
        {onBack && (
          <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />} className="w-full sm:w-auto">
            Back
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{children}</div>
    </div>
  );
}

export function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
