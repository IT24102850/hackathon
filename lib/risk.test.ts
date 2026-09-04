import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISTRICTS, DISTRICT_COUNT } from "./districts.ts";
import { filterDistricts } from "./filter.ts";
import { bandForScore, bandRank, RISK_BANDS, scoreDistrict, toDistrictRisk } from "./risk.ts";
import { resolveScenario, SCENARIOS } from "./scenarios.ts";
import type { DistrictRisk, RiskBandId } from "./types.ts";

/**
 * Acceptance tests for Feature 1. Each block quotes the acceptance criterion
 * it is checking, so a failure points straight at the requirement it breaks.
 */

describe("FR-1.2 — risk score", () => {
  it("scores 18 for 0mm forecast and vulnerability 0.90", () => {
    assert.equal(scoreDistrict(0, 0, 0.9), 18);
  });

  it("scores 98 for 150mm in 24h, 300mm over 72h and vulnerability 0.90", () => {
    assert.equal(scoreDistrict(150, 300, 0.9), 98);
  });

  it("caps the 24-hour term at 100mm", () => {
    assert.equal(scoreDistrict(100, 0, 0), scoreDistrict(500, 0, 0));
    assert.equal(scoreDistrict(100, 0, 0), 50);
  });

  it("caps the 72-hour term at 250mm", () => {
    assert.equal(scoreDistrict(0, 250, 0), scoreDistrict(0, 900, 0));
    assert.equal(scoreDistrict(0, 250, 0), 30);
  });

  it("stays within 0 and 100 for the extremes", () => {
    assert.equal(scoreDistrict(0, 0, 0), 0);
    assert.equal(scoreDistrict(1000, 1000, 1), 100);
  });
});

describe("FR-1.3 — risk bands", () => {
  it("maps each band to its documented range", () => {
    assert.equal(bandForScore(0), "low");
    assert.equal(bandForScore(29), "low");
    assert.equal(bandForScore(30), "moderate");
    assert.equal(bandForScore(49), "moderate");
    assert.equal(bandForScore(50), "high");
    assert.equal(bandForScore(69), "high");
    assert.equal(bandForScore(70), "severe");
    assert.equal(bandForScore(100), "severe");
  });

  it("gives every band a distinct colour and its own instruction", () => {
    const bands = Object.values(RISK_BANDS);
    const dots = new Set(bands.map((band) => band.dot));
    const advice = new Set(bands.map((band) => band.instruction));

    assert.equal(dots.size, 4, "each band needs its own colour");
    assert.equal(advice.size, 4, "each band needs its own instruction");
    for (const band of bands) {
      assert.ok(band.instruction.length > 0);
      assert.ok(band.headline.length > 0);
    }
  });

  it("orders bands least to most severe", () => {
    assert.ok(bandRank("low") < bandRank("moderate"));
    assert.ok(bandRank("moderate") < bandRank("high"));
    assert.ok(bandRank("high") < bandRank("severe"));
  });
});

describe("district dataset", () => {
  it("covers all 25 districts with unique ids", () => {
    assert.equal(DISTRICT_COUNT, 25);
    assert.equal(new Set(DISTRICTS.map((d) => d.id)).size, 25);
  });

  it("keeps every vulnerability between 0 and 1", () => {
    for (const district of DISTRICTS) {
      assert.ok(
        district.vulnerability >= 0 && district.vulnerability <= 1,
        `${district.name} has an out-of-range vulnerability`,
      );
    }
  });

  it("places every district inside Sri Lanka's bounding box", () => {
    for (const district of DISTRICTS) {
      assert.ok(district.latitude > 5.9 && district.latitude < 9.9, district.name);
      assert.ok(district.longitude > 79.6 && district.longitude < 81.9, district.name);
    }
  });
});

/** Build a scored district for filter tests without calling the network. */
function scored(name: string, province: string, basin: string, score: number): DistrictRisk {
  return {
    id: name.toLowerCase(),
    name,
    province,
    basin,
    latitude: 0,
    longitude: 0,
    vulnerability: 0.5,
    rain24h: 0,
    rain72h: 0,
    score,
    band: bandForScore(score),
  };
}

const SAMPLE: DistrictRisk[] = [
  scored("Kalutara", "Western", "Kalu Ganga", 75),
  scored("Ratnapura", "Sabaragamuwa", "Kalu Ganga", 55),
  scored("Colombo", "Western", "Kelani Ganga", 35),
  scored("Jaffna", "Northern", "Thondamanaru Lagoon", 10),
];

describe("FR-1.5 — search", () => {
  it("returns Kalutara and the Kalu Ganga districts for 'kalu'", () => {
    const names = filterDistricts(SAMPLE, { query: "kalu", minBand: "low" }).map((d) => d.name);
    assert.deepEqual(names.sort(), ["Kalutara", "Ratnapura"]);
  });

  it("is case-insensitive and ignores surrounding spaces", () => {
    const upper = filterDistricts(SAMPLE, { query: "  KALU  ", minBand: "low" });
    assert.equal(upper.length, 2);
  });

  it("matches on province as well as name and basin", () => {
    const names = filterDistricts(SAMPLE, { query: "western", minBand: "low" }).map((d) => d.name);
    assert.deepEqual(names.sort(), ["Colombo", "Kalutara"]);
  });

  it("returns nothing when nothing matches", () => {
    assert.equal(filterDistricts(SAMPLE, { query: "zzz", minBand: "low" }).length, 0);
  });

  it("returns everything for an empty query", () => {
    assert.equal(filterDistricts(SAMPLE, { query: "", minBand: "low" }).length, SAMPLE.length);
  });
});

describe("FR-1.6 — minimum band filter", () => {
  it("hides all Low and Moderate districts at 'High and above'", () => {
    const result = filterDistricts(SAMPLE, { query: "", minBand: "high" });
    assert.deepEqual(result.map((d) => d.name).sort(), ["Kalutara", "Ratnapura"]);
    for (const district of result) {
      assert.ok(bandRank(district.band) >= bandRank("high" as RiskBandId));
    }
  });

  it("keeps only Severe at 'Severe only'", () => {
    const result = filterDistricts(SAMPLE, { query: "", minBand: "severe" });
    assert.deepEqual(result.map((d) => d.name), ["Kalutara"]);
  });

  it("keeps everything at 'All bands'", () => {
    assert.equal(filterDistricts(SAMPLE, { query: "", minBand: "low" }).length, 4);
  });

  it("applies the search and the band filter together", () => {
    const result = filterDistricts(SAMPLE, { query: "kalu", minBand: "severe" });
    assert.deepEqual(result.map((d) => d.name), ["Kalutara"]);
  });
});

describe("scenarios", () => {
  it("defaults to the live forecast for an unknown id", () => {
    assert.equal(resolveScenario("nonsense").id, "live");
    assert.equal(resolveScenario(null).id, "live");
    assert.equal(resolveScenario(undefined).id, "live");
  });

  it("leaves live rainfall untouched", () => {
    assert.equal(resolveScenario("live").multiplier, 1);
  });

  it("only scales rainfall upward in simulations", () => {
    for (const scenario of SCENARIOS) {
      assert.ok(scenario.multiplier >= 1, `${scenario.id} must not reduce rainfall`);
    }
  });
});

describe("toDistrictRisk", () => {
  it("attaches the score and band to the district", () => {
    const district = DISTRICTS.find((d) => d.id === "ratnapura")!;
    const risk = toDistrictRisk(district, 150, 300);

    assert.equal(risk.name, "Ratnapura");
    assert.equal(risk.score, scoreDistrict(150, 300, district.vulnerability));
    assert.equal(risk.band, bandForScore(risk.score));
  });

  it("rounds rainfall to one decimal for display", () => {
    const district = DISTRICTS[0];
    assert.equal(toDistrictRisk(district, 12.3456, 45.6789).rain24h, 12.3);
    assert.equal(toDistrictRisk(district, 12.3456, 45.6789).rain72h, 45.7);
  });
});
