export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 shadow-md shadow-brand-500/20">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold text-slate-900 dark:text-white">AI Reel Builder</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">Idea to Reel, step by step</div>
      </div>
    </div>
  );
}
