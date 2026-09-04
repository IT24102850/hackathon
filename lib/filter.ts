// Relative with an extension so `node --test` can resolve it without a bundler.
import { bandRank } from "./risk.ts";
import type { DistrictRisk, RiskBandId } from "@/lib/types";

/**
 * Search and band filtering for the risk board.
 *
 * Kept as a pure function, separate from the component, so the FR-1.5 and
 * FR-1.6 acceptance cases can be tested directly.
 */

export interface BoardFilters {
  /** Free text matched against district name, province and river basin. */
  query: string;
  /** Lowest band to include. "low" keeps everything. */
  minBand: RiskBandId;
}

/**
 * Case-insensitive substring match on name, province or basin, then drop any
 * district below the selected band.
 */
export function filterDistricts(
  districts: DistrictRisk[],
  { query, minBand }: BoardFilters,
): DistrictRisk[] {
  const needle = query.trim().toLowerCase();
  const floor = bandRank(minBand);

  return districts.filter((district) => {
    if (bandRank(district.band) < floor) return false;
    if (!needle) return true;

    return (
      district.name.toLowerCase().includes(needle) ||
      district.province.toLowerCase().includes(needle) ||
      district.basin.toLowerCase().includes(needle)
    );
  });
}
