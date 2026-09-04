import { RiskBadge } from "@/components/risk-badge";
import { formatMm } from "@/lib/format";
import { DISTRICT_IMAGES } from "@/lib/district-images";
import { RISK_BANDS } from "@/lib/risk";
import type { DistrictRisk } from "@/lib/types";
import Image from "next/image";

/** One district in the board grid: score, band, rainfall and what to do. */
export function DistrictCard({ district }: { district: DistrictRisk }) {
  const meta = RISK_BANDS[district.band];
  const image = DISTRICT_IMAGES[district.id];

  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${meta.edge}`}
    >
      <figure className="overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
        <Image
          src={image.url}
          width={image.width}
          height={image.height}
          alt={image.alt}
          className="h-40 w-full object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        <figcaption className="px-2 py-1 text-[10px] text-slate-500 dark:text-slate-400">
          Photo: {image.credit} ({image.license})
        </figcaption>
      </figure>

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">
            {district.name}
          </h3>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {district.province} &middot; {district.basin}
          </p>
        </div>
        <RiskBadge band={district.band} className="shrink-0" />
      </header>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Risk score
          </span>
          <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
            {district.score}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="img"
          aria-label={`Risk score ${district.score} out of 100, ${meta.label}`}
        >
          <div
            className={`h-full rounded-full ${meta.bar}`}
            style={{ width: `${district.score}%` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <dt className="text-xs text-slate-500 dark:text-slate-400">
            Next 24 h
          </dt>
          <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {formatMm(district.rain24h)}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
          <dt className="text-xs text-slate-500 dark:text-slate-400">
            Next 72 h
          </dt>
          <dd className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {formatMm(district.rain72h)}
          </dd>
        </div>
      </dl>

      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {meta.headline}.
        </span>{" "}
        {meta.instruction}
      </p>
    </article>
  );
}
