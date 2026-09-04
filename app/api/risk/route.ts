import { NextResponse } from "next/server";

import { DISTRICTS } from "@/lib/districts";
import { toDistrictRisk } from "@/lib/risk";
import type { DistrictRisk } from "@/lib/types";

/**
 * GET /api/risk
 *
 * Fetches the rainfall forecast for all 25 districts in a single call to
 * Open-Meteo, scores each district, and returns the board sorted by score.
 *
 * Open-Meteo takes comma-separated coordinate lists and answers with one
 * forecast object per coordinate pair, in the order they were sent. That is
 * why this is one request and not 25, and it needs no API key.
 *
 * Scoring happens here rather than in the browser so the numbers on screen
 * come from one place and the client stays a thin view.
 */

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_DAYS = 3; // today plus two, which gives us the 72-hour window
const REQUEST_TIMEOUT_MS = 12_000;

/** Never cache: a warning board showing yesterday's rain is worse than none. */
export const dynamic = "force-dynamic";

/** The slice of the Open-Meteo response we rely on. */
interface OpenMeteoLocation {
  daily?: {
    time?: string[];
    precipitation_sum?: (number | null)[];
  };
}

export async function GET() {
  const query = new URLSearchParams({
    latitude: DISTRICTS.map((d) => d.latitude).join(","),
    longitude: DISTRICTS.map((d) => d.longitude).join(","),
    daily: "precipitation_sum",
    forecast_days: String(FORECAST_DAYS),
    timezone: "Asia/Colombo",
  });

  let payload: unknown;

  try {
    const response = await fetch(`${OPEN_METEO_URL}?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return failure(
        `The Open-Meteo forecast service replied with HTTP ${response.status} (${response.statusText || "no status text"}).`,
      );
    }

    payload = await response.json();
  } catch (error) {
    // Covers DNS failure, offline, a blocked request and the timeout above.
    const reason =
      error instanceof Error && error.name === "TimeoutError"
        ? `it did not respond within ${REQUEST_TIMEOUT_MS / 1000} seconds`
        : "the request could not be completed";
    return failure(`Could not reach the Open-Meteo forecast service: ${reason}.`);
  }

  // A single coordinate returns an object; a list returns an array.
  const locations: OpenMeteoLocation[] = Array.isArray(payload)
    ? (payload as OpenMeteoLocation[])
    : [payload as OpenMeteoLocation];

  if (locations.length !== DISTRICTS.length) {
    return failure(
      `Open-Meteo returned ${locations.length} forecasts but we asked about ${DISTRICTS.length} districts.`,
    );
  }

  const districts: DistrictRisk[] = [];

  for (const [index, district] of DISTRICTS.entries()) {
    const daily = locations[index]?.daily?.precipitation_sum;

    if (!Array.isArray(daily) || daily.length < FORECAST_DAYS) {
      return failure(
        `Open-Meteo returned no rainfall figures for ${district.name}.`,
      );
    }

    // Open-Meteo sends null for a day it has no value for; treat that as 0mm.
    const mmPerDay = daily.slice(0, FORECAST_DAYS).map((mm) => mm ?? 0);
    const rain24h = mmPerDay[0];
    const rain72h = mmPerDay.reduce((total, mm) => total + mm, 0);

    districts.push(toDistrictRisk(district, rain24h, rain72h));
  }

  districts.sort((a, b) => b.score - a.score);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      source: "Open-Meteo forecast API",
      districts,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** 502: we are fine, the upstream forecast is not. */
function failure(message: string) {
  return NextResponse.json({ error: message }, { status: 502 });
}
