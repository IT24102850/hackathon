import type { District, DistrictRisk, RiskBandId } from "@/lib/types";

/**
 * Risk scoring for the Live District Risk Board.
 *
 * A district's score is the sum of three weighted parts, out of 100:
 *
 *   short-burst rainfall   min(rain24h / 100mm, 1) * 50
 *   sustained saturation   min(rain72h / 250mm, 1) * 30
 *   standing vulnerability vulnerability * 20
 *
 * The 24-hour term carries the most weight because flash flooding in the
 * Kelani and Kalu basins follows a single heavy day. The 72-hour term catches
 * the slower case where ground is already saturated and a modest extra fall
 * triggers a landslide. Vulnerability is the floor: a district that always
 * floods never reads as completely safe.
 */

/** Rainfall in 24h that alone maxes out the short-burst term. */
export const RAIN_24H_CAP_MM = 100;
/** Rainfall in 72h that alone maxes out the saturation term. */
export const RAIN_72H_CAP_MM = 250;

const WEIGHT_24H = 50;
const WEIGHT_72H = 30;
const WEIGHT_VULNERABILITY = 20;

/**
 * Score a district from 0 to 100. Rainfall is in millimetres, vulnerability
 * is 0 to 1. Both rainfall terms are capped, so more rain past the cap does
 * not keep pushing the score up.
 */
export function scoreDistrict(
  rain24h: number,
  rain72h: number,
  vulnerability: number,
): number {
  const burst = Math.min(rain24h / RAIN_24H_CAP_MM, 1) * WEIGHT_24H;
  const saturation = Math.min(rain72h / RAIN_72H_CAP_MM, 1) * WEIGHT_72H;
  const standing = vulnerability * WEIGHT_VULNERABILITY;
  return Math.round(burst + saturation + standing);
}

/** Bands from least to most severe. The filter dropdown reads this order. */
export const BAND_ORDER: RiskBandId[] = ["low", "moderate", "high", "severe"];

/** Lowest score that still counts as each band. */
const BAND_THRESHOLDS: Record<RiskBandId, number> = {
  severe: 70,
  high: 50,
  moderate: 30,
  low: 0,
};

/**
 * Map a score to its band. Checked most severe first, so a score sitting
 * exactly on a threshold lands in the higher band (70 is Severe, not High).
 */
export function bandForScore(score: number): RiskBandId {
  if (score >= BAND_THRESHOLDS.severe) return "severe";
  if (score >= BAND_THRESHOLDS.high) return "high";
  if (score >= BAND_THRESHOLDS.moderate) return "moderate";
  return "low";
}

/** Position in BAND_ORDER, so bands can be compared with `>=`. */
export function bandRank(band: RiskBandId): number {
  return BAND_ORDER.indexOf(band);
}

/** Presentation and advice attached to each band. */
export interface RiskBand {
  id: RiskBandId;
  label: string;
  /** Lowest score in the band, shown in the methodology table. */
  min: number;
  /** Two or three words naming the action. */
  headline: string;
  /** What a resident of this district should actually do. */
  instruction: string;
  /** Tailwind classes, written out in full so the compiler keeps them. */
  chip: string;
  dot: string;
  bar: string;
  edge: string;
}

export const RISK_BANDS: Record<RiskBandId, RiskBand> = {
  severe: {
    id: "severe",
    label: "Severe",
    min: BAND_THRESHOLDS.severe,
    headline: "Move now",
    instruction:
      "Leave for higher ground or your nearest safe centre now. Call the Disaster Management Centre on 117 if you need help getting out.",
    chip: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    edge: "border-l-rose-500",
  },
  high: {
    id: "high",
    label: "High",
    min: BAND_THRESHOLDS.high,
    headline: "Prepare to move",
    instruction:
      "Pack documents, medicine and a phone charger in one bag. Confirm where your nearest safe centre is and be ready to leave tonight.",
    chip: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/30",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
    edge: "border-l-orange-500",
  },
  moderate: {
    id: "moderate",
    label: "Moderate",
    min: BAND_THRESHOLDS.moderate,
    headline: "Stay alert",
    instruction:
      "Move valuables, documents and livestock off the ground floor. Check the DMC bulletin morning and evening.",
    chip: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    edge: "border-l-amber-500",
  },
  low: {
    id: "low",
    label: "Low",
    min: BAND_THRESHOLDS.low,
    headline: "Normal conditions",
    instruction:
      "No action needed. Check back if heavy rain is forecast for your area.",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    edge: "border-l-emerald-500",
  },
};

/** Bands most severe first, for the methodology table and the legend. */
export const BANDS_BY_SEVERITY: RiskBand[] = [...BAND_ORDER]
  .reverse()
  .map((id) => RISK_BANDS[id]);

/**
 * Combine a district with its forecast rainfall into a scored, banded row.
 */
export function toDistrictRisk(
  district: District,
  rain24h: number,
  rain72h: number,
): DistrictRisk {
  const score = scoreDistrict(rain24h, rain72h, district.vulnerability);
  return {
    ...district,
    rain24h: Math.round(rain24h * 10) / 10,
    rain72h: Math.round(rain72h * 10) / 10,
    score,
    band: bandForScore(score),
  };
}
