/**
 * Shared types for the Live District Risk Board.
 */

/** The four risk bands, ordered least to most severe in BAND_ORDER. */
export type RiskBandId = "low" | "moderate" | "high" | "severe";

/** A Sri Lankan administrative district we monitor. */
export interface District {
  /** Stable slug used as a React key and in URLs. */
  id: string;
  name: string;
  province: string;
  /** Main river basin draining the district. Searchable alongside the name. */
  basin: string;
  latitude: number;
  longitude: number;
  /**
   * Standing vulnerability, 0 to 1. Combines terrain steepness, drainage
   * capacity and how often the district has flooded before. Fixed per
   * district; only the rainfall part of the score moves day to day.
   */
  vulnerability: number;
}

/** A district plus the forecast and score computed for it. */
export interface DistrictRisk extends District {
  /** Forecast rainfall for the next 24 hours, in millimetres. */
  rain24h: number;
  /** Forecast rainfall for the next 72 hours, in millimetres. */
  rain72h: number;
  /** Composite risk score, 0 to 100. */
  score: number;
  band: RiskBandId;
}

/** Successful payload returned by GET /api/risk. */
export interface RiskBoardResponse {
  /** When the forecast was fetched, ISO 8601. */
  generatedAt: string;
  /** Human-readable attribution for the forecast data. */
  source: string;
  /** Every monitored district, sorted highest score first. */
  districts: DistrictRisk[];
}

/** Error payload returned by GET /api/risk when the forecast is unavailable. */
export interface RiskBoardError {
  error: string;
}
