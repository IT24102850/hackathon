"use client";

/** Loading, error and empty views for the risk board. */

/** Shown on first load, before any forecast has arrived. */
export function BoardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy role="status">
      <span className="sr-only">Loading the district risk board</span>
      <div className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-56 rounded-xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Shown when the forecast could not be retrieved. Names the failure and
 * offers a retry. We deliberately show no district data here: a stale board
 * presented as current is more dangerous than an honest error.
 */
export function BoardError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/30"
    >
      <h2 className="text-lg font-semibold text-rose-900 dark:text-rose-200">
        The risk board could not be updated
      </h2>
      <p className="mx-auto mt-2 max-w-prose text-sm leading-relaxed text-rose-800 dark:text-rose-300">
        {message}
      </p>
      <p className="mx-auto mt-2 max-w-prose text-sm text-rose-700/80 dark:text-rose-300/70">
        No scores are shown, because out-of-date rainfall must not be read as
        the current warning. If this keeps happening, call the Disaster
        Management Centre on 117.
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-4 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isRetrying ? "Retrying…" : "Try again"}
      </button>
    </div>
  );
}

/**
 * Shown whenever the board is running on scaled rainfall instead of the live
 * forecast. Deliberately loud: a warning board showing invented Severe alerts
 * must never be mistaken for a real one.
 */
export function SimulationBanner({
  label,
  description,
  onUseLive,
}: {
  label: string;
  description: string;
  onUseLive: () => void;
}) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border-2 border-amber-400 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/60 dark:bg-amber-950/30"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-amber-950"
          aria-hidden
        >
          !
        </span>
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Simulated data — this is not a real warning
          </p>
          <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300/90">
            <span className="font-semibold">{label}.</span> {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onUseLive}
        className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
      >
        Back to live forecast
      </button>
    </div>
  );
}

/** Shown when the search and filter together match no districts. */
export function BoardEmpty({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium text-slate-900 dark:text-slate-100">
        No districts match your filters
      </p>
      <p className="mx-auto mt-1 max-w-prose text-sm text-slate-500 dark:text-slate-400">
        {query.trim()
          ? `Nothing is named like "${query.trim()}" at that risk band.`
          : "No district currently sits at that risk band, which is good news."}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Clear filters
      </button>
    </div>
  );
}
