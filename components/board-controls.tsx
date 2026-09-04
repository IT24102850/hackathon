"use client";

import { BAND_ORDER, RISK_BANDS } from "@/lib/risk";
import { SCENARIOS } from "@/lib/scenarios";
import type { RiskBandId } from "@/lib/types";

/** Wording for the minimum-band filter, keyed by the lowest band it lets through. */
const FILTER_LABELS: Record<RiskBandId, string> = {
  low: "All bands",
  moderate: "Moderate and above",
  high: "High and above",
  severe: "Severe only",
};

export function BoardControls({
  query,
  onQueryChange,
  minBand,
  onMinBandChange,
  scenarioId,
  onScenarioChange,
  onRefresh,
  isRefreshing,
  shown,
  total,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  minBand: RiskBandId;
  onMinBandChange: (value: RiskBandId) => void;
  scenarioId: string;
  onScenarioChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  shown: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1">
          <label
            htmlFor="district-search"
            className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            Search district, province or river basin
          </label>
          <input
            id="district-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Try Kalu, Uva or Ratnapura"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="w-full sm:w-52">
          <label
            htmlFor="band-filter"
            className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            Minimum risk band
          </label>
          <select
            id="band-filter"
            value={minBand}
            onChange={(event) =>
              onMinBandChange(event.target.value as RiskBandId)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {BAND_ORDER.map((band) => (
              <option key={band} value={band}>
                {FILTER_LABELS[band]}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-56">
          <label
            htmlFor="scenario-select"
            className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            Rainfall scenario
          </label>
          <select
            id="scenario-select"
            value={scenarioId}
            onChange={(event) => onScenarioChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto dark:disabled:bg-slate-700"
        >
          {isRefreshing ? (
            <>
              <Spinner />
              Refreshing&hellip;
            </>
          ) : (
            "Refresh forecast"
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p
          className="text-sm text-slate-600 dark:text-slate-300"
          aria-live="polite"
        >
          Showing <span className="font-semibold">{shown}</span> of {total}{" "}
          districts
        </p>
        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {[...BAND_ORDER].reverse().map((band) => {
        const meta = RISK_BANDS[band];
        return (
          <li
            key={band}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            <span
              className={`h-2 w-2 rounded-full ${meta.dot}`}
              aria-hidden
            />
            {meta.id === "low" ? "Low, under 30" : `${meta.label} ${meta.min}+`}
          </li>
        );
      })}
    </ul>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}
