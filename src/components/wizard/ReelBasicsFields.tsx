import { Field, Input, Textarea } from '@/components/ui/Field';
import { TONES } from '@/data/options';
import { cn } from '@/lib/utils';

/** Audience, tone and call-to-action fields, shared by the Idea step and the own-video Video step. */

export function AudienceField({
  value,
  onChange,
  error,
  hint = 'Who are you trying to reach?',
  placeholder = 'e.g. Busy parents in our neighborhood',
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <Field label="Audience" required error={error} hint={hint}>
      {(id) => (
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          maxLength={120}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function ToneField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">Tone</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TONES.map((t) => (
          <label
            key={t.value}
            className={cn(
              'cursor-pointer rounded-lg border p-3 transition-colors',
              value === t.value
                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500 dark:bg-brand-500/10'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
            )}
          >
            <input
              type="radio"
              name="tone"
              value={t.value}
              checked={value === t.value}
              onChange={() => onChange(t.value)}
              className="sr-only"
            />
            <span className="block text-sm font-semibold text-slate-900 dark:text-white">{t.value}</span>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{t.description}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CallToActionField({
  value,
  onChange,
  hint = "What should viewers do after watching? Leave blank and we'll suggest one.",
}: {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <Field label="Call To Action" hint={hint}>
      {(id) => (
        <Textarea
          id={id}
          rows={2}
          value={value}
          placeholder="e.g. Book your free consultation at the link in our bio"
          maxLength={160}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}
