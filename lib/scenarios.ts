/**
 * Rainfall scenarios.
 *
 * Sri Lanka sits between monsoons for much of the year, so on a calm week the
 * live forecast puts every district in the Low band. That is the correct
 * answer, but it makes the warning logic impossible to exercise — you cannot
 * check that a Severe card turns red by waiting for a flood.
 *
 * A scenario multiplies the forecast rainfall before scoring. It changes only
 * the input; the formula in lib/risk.ts is untouched. Anything other than
 * `live` is simulated and the UI must say so on screen.
 *
 * The x8 monsoon figure was chosen by running every multiplier from 4 to 14
 * against a live forecast and picking the one that put districts in all four
 * bands at once. The exact split shifts with the day's weather.
 */

export interface Scenario {
  id: string;
  label: string;
  /** Forecast rainfall is multiplied by this before scoring. */
  multiplier: number;
  /** Shown in the simulation banner. */
  description: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "live",
    label: "Live forecast",
    multiplier: 1,
    description: "Real rainfall forecast from Open-Meteo.",
  },
  {
    id: "monsoon",
    label: "Simulated monsoon",
    multiplier: 8,
    description:
      "Today's forecast with rainfall multiplied by 8, roughly a heavy south-west monsoon week.",
  },
  {
    id: "extreme",
    label: "Simulated extreme event",
    multiplier: 14,
    description:
      "Today's forecast with rainfall multiplied by 14, on the scale of the May 2017 Kalu Ganga floods.",
  },
];

export const LIVE_SCENARIO_ID = "live";

/** The default. Anything unrecognised falls back to this. */
const LIVE_SCENARIO = SCENARIOS[0];

/** Look up a scenario by id, falling back to the live forecast. */
export function resolveScenario(id: string | null | undefined): Scenario {
  return SCENARIOS.find((scenario) => scenario.id === id) ?? LIVE_SCENARIO;
}
