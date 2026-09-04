"use client";

import { useState } from "react";
import { useEffect } from "react";

import { RISK_BANDS } from "@/lib/risk";
import type { DistrictRisk } from "@/lib/types";

type MapMetric = "risk" | "rain24h";

type GadmGeometry = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};

type GadmFeature = {
  properties: { NAME_1: string };
  geometry: GadmGeometry;
};

type GadmCollection = { features: GadmFeature[] };

const BAND_COLORS = {
  severe: "#f43f5e",
  high: "#f97316",
  moderate: "#f59e0b",
  low: "#10b981",
} as const;

const GADM_DISTRICTS_URL = "/api/boundaries";

/** A compact, dependency-free 2D overview of all 25 Sri Lankan districts. */
export function DistrictMap({ districts }: { districts: DistrictRisk[] }) {
  const [metric, setMetric] = useState<MapMetric>("risk");
  const [showLabels, setShowLabels] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boundaries, setBoundaries] = useState<GadmCollection | null>(null);
  const selected = districts.find((district) => district.id === selectedId);

  useEffect(() => {
    let active = true;
    fetch(GADM_DISTRICTS_URL)
      .then((response) => {
        if (!response.ok) throw new Error("GADM boundary request failed");
        return response.json() as Promise<GadmCollection>;
      })
      .then((data) => {
        if (active) setBoundaries(data);
      })
      .catch(() => {
        if (active) setBoundaries({ features: [] });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      id="district-map"
      aria-labelledby="district-map-heading"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101a2d] shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-slate-800 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Situation map
          </p>
          <h2 id="district-map-heading" className="mt-1 text-xl font-bold text-white sm:text-2xl">
            Sri Lanka, district by district
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {districts.length} of 25 districts plotted from the live forecast.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Map display controls">
          <ToggleButton active={metric === "risk"} onClick={() => setMetric("risk")}>
            Risk score
          </ToggleButton>
          <ToggleButton active={metric === "rain24h"} onClick={() => setMetric("rain24h")}>
            24 h rain
          </ToggleButton>
          <ToggleButton active={showLabels} onClick={() => setShowLabels((value) => !value)}>
            {showLabels ? "Hide labels" : "Show labels"}
          </ToggleButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-h-[26rem] overflow-hidden bg-[#0b1425] p-3 sm:p-6">
          <svg
            viewBox="0 0 100 100"
            className="h-full min-h-[24rem] w-full"
            role="img"
            aria-labelledby="map-title map-description"
          >
            <title id="map-title">Sri Lanka district risk map</title>
            <desc id="map-description">
              All 25 district capitals are shown as selectable markers. Marker color represents {metric === "risk" ? "risk score" : "rainfall in the next 24 hours"}.
            </desc>
            <defs>
              <pattern id="map-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1d2b43" strokeWidth="0.12" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#map-grid)" opacity="0.7" />
            {boundaries?.features.map((feature, index) => {
              const district = districts.find(
                (item) => sameDistrictName(item.name, feature.properties.NAME_1),
              );
              if (!district) return null;
              return (
                <path
                  key={`${feature.properties.NAME_1}-${index}`}
                  d={geometryToPath(feature.geometry)}
                  fill={markerColor(district, metric)}
                  fillOpacity="0.55"
                  fillRule="evenodd"
                  stroke="#8ba4c4"
                  strokeOpacity="0.65"
                  strokeWidth="0.16"
                />
              );
            })}
            <path d="M42 12 C52 18 62 22 72 31 M27 55 C40 51 56 54 77 48 M30 73 C45 68 61 72 75 66" fill="none" stroke="#2b4968" strokeWidth="0.25" strokeDasharray="1 1" />
            {districts.map((district) => {
              const x = longitudeToX(district.longitude);
              const y = latitudeToY(district.latitude);
              const active = district.id === selectedId;
              const color = markerColor(district, metric);

              return (
                <g
                  key={district.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${district.name}, ${metric === "risk" ? `risk score ${district.score}` : `${district.rain24h} millimetres in 24 hours`}`}
                  onClick={() => setSelectedId(district.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(district.id);
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  {active ? <circle cx={x} cy={y} r="2.8" fill="none" stroke="#ffffff" strokeWidth="0.5" /> : null}
                  <circle cx={x} cy={y} r="1.5" fill={color} stroke="#07101f" strokeWidth="0.45" />
                  {showLabels ? (
                    <text x={x + 2} y={y + 0.8} fill="#dbeafe" fontSize="2.35" paintOrder="stroke" stroke="#0b1425" strokeWidth="0.7">
                      {district.name}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
          <p className="px-2 pb-1 text-center text-[11px] text-slate-500">
            GADM district boundaries · Select any marker to inspect its forecast details.
          </p>
        </div>

        <aside className="border-t border-slate-800 bg-[#101a2d] p-5 lg:border-l lg:border-t-0">
          {selected ? <MapDetails district={selected} metric={metric} /> : <MapLegend metric={metric} />}
        </aside>
      </div>
    </section>
  );
}

function ToggleButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${active ? "border-cyan-400 bg-cyan-400/15 text-cyan-200" : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"}`}
    >
      {children}
    </button>
  );
}

function MapLegend({ metric }: { metric: MapMetric }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Map key</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{metric === "risk" ? "Risk severity" : "24-hour rainfall"}</h3>
      <div className="mt-5 space-y-3">
        {(["severe", "high", "moderate", "low"] as const).map((band) => (
          <div key={band} className="flex items-center gap-3 text-sm text-slate-300">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: BAND_COLORS[band] }} aria-hidden />
            <span>{RISK_BANDS[band].label}</span>
            {metric === "risk" ? <span className="ml-auto text-xs text-slate-500">{band === "low" ? "0-29" : `${RISK_BANDS[band].min}+`}</span> : null}
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs leading-relaxed text-slate-500">Colors update when you change the rainfall scenario or refresh the forecast.</p>
    </div>
  );
}

function MapDetails({ district, metric }: { district: DistrictRisk; metric: MapMetric }) {
  const band = RISK_BANDS[district.band];
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-400">Selected district</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">{district.name}</h3>
          <p className="mt-1 text-xs text-slate-400">{district.province} · {district.basin}</p>
        </div>
        <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={{ color: BAND_COLORS[district.band], backgroundColor: `${BAND_COLORS[district.band]}22` }}>
          {band.label}
        </span>
      </div>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
          <dt className="text-slate-400">Risk score</dt>
          <dd className="text-2xl font-bold tabular-nums text-white">{district.score}<span className="ml-1 text-xs font-normal text-slate-500">/100</span></dd>
        </div>
        <div className="flex justify-between"><dt className="text-slate-400">Next 24 h</dt><dd className={`font-semibold tabular-nums ${metric === "rain24h" ? "text-cyan-300" : "text-slate-200"}`}>{district.rain24h} mm</dd></div>
        <div className="flex justify-between"><dt className="text-slate-400">Next 72 h</dt><dd className="font-semibold tabular-nums text-slate-200">{district.rain72h} mm</dd></div>
      </dl>
      <p className="mt-6 border-l-2 pl-3 text-sm leading-relaxed text-slate-300" style={{ borderColor: BAND_COLORS[district.band] }}>{band.instruction}</p>
    </div>
  );
}

function markerColor(district: DistrictRisk, metric: MapMetric) {
  if (metric === "risk") return BAND_COLORS[district.band];
  const intensity = Math.min(district.rain24h / 100, 1);
  return `hsl(${190 - intensity * 170} 85% 55%)`;
}

function sameDistrictName(left: string, right: string) {
  return left.replaceAll(" ", "").toLowerCase() === right.replaceAll(" ", "").toLowerCase()
    || (left === "Monaragala" && right === "Moneragala");
}

function longitudeToX(longitude: number) {
  return ((longitude - 79.6) / (82.0 - 79.6)) * 64 + 18;
}

function latitudeToY(latitude: number) {
  return ((10.1 - latitude) / (10.1 - 5.8)) * 92 + 3;
}

function geometryToPath(geometry: GadmGeometry) {
  return geometry.coordinates
    .map((polygon) =>
      polygon
        .map((ring) =>
          `${ring
            .map(([longitude, latitude], index) => `${index === 0 ? "M" : "L"}${longitudeToX(longitude)} ${latitudeToY(latitude)}`)
            .join(" ")} Z`,
        )
        .join(" "),
    )
    .join(" ");
}
