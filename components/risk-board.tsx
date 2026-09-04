"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { BoardControls } from "@/components/board-controls";
import {
  BoardEmpty,
  BoardError,
  BoardSkeleton,
  SimulationBanner,
} from "@/components/board-states";
import { DistrictCard } from "@/components/district-card";
import { HeroDistrict } from "@/components/hero-district";
import { DISTRICT_COUNT } from "@/lib/districts";
import { bandRank } from "@/lib/risk";
import { LIVE_SCENARIO_ID } from "@/lib/scenarios";
import type { RiskBandId, RiskBoardResponse } from "@/lib/types";

/**
 * The Live District Risk Board.
 *
 * Owns the forecast request, the search and filter state, and which of the
 * four views is on screen: loading, error, empty or the board itself.
 */
export function RiskBoard() {
  const [board, setBoard] = useState<RiskBoardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  const [query, setQuery] = useState("");
  const [minBand, setMinBand] = useState<RiskBandId>("low");
  const [scenarioId, setScenarioId] = useState(LIVE_SCENARIO_ID);

  const load = useCallback(async (scenario: string) => {
    setIsPending(true);

    try {
      const response = await fetch(
        `/api/risk?scenario=${encodeURIComponent(scenario)}`,
        { cache: "no-store" },
      );
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(readErrorMessage(body, response.status));
      }

      setBoard(body as RiskBoardResponse);
      setError(null);
    } catch (caught) {
      // Drop what we were holding. A board of yesterday's rainfall presented
      // as today's warning is worse than showing nothing at all.
      setBoard(null);
      setError(describeFailure(caught));
    } finally {
      setIsPending(false);
    }
  }, []);

  // Runs on mount and again whenever the scenario changes.
  useEffect(() => {
    void load(scenarioId);
  }, [load, scenarioId]);

  const refresh = useCallback(() => {
    void load(scenarioId);
  }, [load, scenarioId]);

  /** Search on name, province or basin; then keep only bands at or above the floor. */
  const visible = useMemo(() => {
    if (!board) return [];

    const needle = query.trim().toLowerCase();
    const floor = bandRank(minBand);

    return board.districts.filter((district) => {
      if (bandRank(district.band) < floor) return false;
      if (!needle) return true;

      return (
        district.name.toLowerCase().includes(needle) ||
        district.province.toLowerCase().includes(needle) ||
        district.basin.toLowerCase().includes(needle)
      );
    });
  }, [board, query, minBand]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setMinBand("low");
  }, []);

  if (error) {
    return (
      <BoardError message={error} onRetry={refresh} isRetrying={isPending} />
    );
  }

  if (!board) {
    return <BoardSkeleton />;
  }

  // Districts arrive sorted highest score first, so the hero is the top row.
  // It ignores the filters on purpose: the worst district stays visible even
  // while you are searching for somewhere else.
  const worst = board.districts[0];

  return (
    <div className="space-y-6">
      {board.simulated ? (
        <SimulationBanner
          label={board.scenario.label}
          description={board.scenario.description}
          onUseLive={() => setScenarioId(LIVE_SCENARIO_ID)}
        />
      ) : null}

      {worst ? (
        <HeroDistrict district={worst} generatedAt={board.generatedAt} />
      ) : null}

      <BoardControls
        query={query}
        onQueryChange={setQuery}
        minBand={minBand}
        onMinBandChange={setMinBand}
        scenarioId={scenarioId}
        onScenarioChange={setScenarioId}
        onRefresh={refresh}
        isRefreshing={isPending}
        shown={visible.length}
        total={DISTRICT_COUNT}
      />

      <div className={isPending ? "opacity-50 transition-opacity" : undefined}>
        {visible.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((district) => (
              <DistrictCard key={district.id} district={district} />
            ))}
          </div>
        ) : (
          <BoardEmpty query={query} onClear={clearFilters} />
        )}
      </div>
    </div>
  );
}

/** Prefer the API's own explanation; fall back to the status code. */
function readErrorMessage(body: unknown, status: number): string {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return `The warning service replied with HTTP ${status}.`;
}

/** Turn a thrown value into something a resident can act on. */
function describeFailure(caught: unknown): string {
  if (caught instanceof TypeError) {
    // fetch rejects with a TypeError when the request never left the browser.
    return "Your browser could not reach the warning service. Check your internet connection and try again.";
  }
  if (caught instanceof Error) {
    return caught.message;
  }
  return "The forecast could not be loaded for an unknown reason.";
}
