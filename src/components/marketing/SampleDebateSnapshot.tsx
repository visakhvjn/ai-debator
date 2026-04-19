/** Static marketing preview — not live AI output. */
export function SampleDebateSnapshot() {
  return (
    <div
      className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-left shadow-md ring-1 ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900/90 dark:ring-white/10"
      aria-label="Sample debate preview"
    >
      <p className="mt-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
        Cities should prioritize dedicated bike lanes over new car lanes.
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-200"
            aria-hidden
          >
            P
          </div>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-sky-100 bg-sky-50 px-3 py-2 text-xs leading-relaxed text-slate-800 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-slate-100">
            <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-sky-700/90 dark:text-sky-300">
              Pro
            </span>
            Safer streets and lower emissions make bike networks a better
            long-term investment than widening roads for cars.
          </div>
        </div>

        <div className="flex flex-row-reverse gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-900 dark:bg-orange-900/50 dark:text-orange-200"
            aria-hidden
          >
            C
          </div>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tr-sm border border-orange-100 bg-orange-50 px-3 py-2 text-xs leading-relaxed text-slate-800 dark:border-orange-900/40 dark:bg-orange-950/35 dark:text-slate-100">
            <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-orange-800/90 dark:text-orange-300">
              Contra
            </span>
            Many residents rely on cars for work and deliveries; cutting car
            capacity without alternatives can hurt access and local business.
          </div>
        </div>

        <div className="flex gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-200"
            aria-hidden
          >
            P
          </div>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-sky-100 bg-sky-50 px-3 py-2 text-xs leading-relaxed text-slate-800 dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-slate-100">
            <span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-sky-700/90 dark:text-sky-300">
              Pro
            </span>
            Mixed lanes and last-mile hubs can pair with bikes so commuters
            still have options while streets get safer.
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
        Your real debates can go deeper — with a summary when you end.
      </p>
    </div>
  );
}
