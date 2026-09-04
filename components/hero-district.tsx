import { RiskBadge } from "@/components/risk-badge";
import { DISTRICT_IMAGES } from "@/lib/district-images";
import { formatMm, formatUpdatedAt } from "@/lib/format";
import { RISK_BANDS } from "@/lib/risk";
import type { DistrictRisk } from "@/lib/types";
import Image from "next/image";

/**
 * The single most at-risk district right now, with its rainfall totals and
 * the action its residents should take. This is the first thing on the page
 * because it is the one answer most people come here for.
 */
export function HeroDistrict({
  district,
  generatedAt,
}: {
  district: DistrictRisk;
  generatedAt: string;
}) {
  const meta = RISK_BANDS[district.band];
  const image = DISTRICT_IMAGES[district.id];

  return (
    <section
      aria-labelledby="hero-heading"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className={`h-1.5 w-full ${meta.bar}`} aria-hidden />

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Highest risk right now
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2
              id="hero-heading"
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50"
            >
              {district.name}
            </h2>
            <RiskBadge band={district.band} />
          </div>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {district.province} Province &middot; {district.basin} basin
          </p>

          <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {meta.headline}
          </p>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {meta.instruction}
          </p>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Forecast retrieved {formatUpdatedAt(generatedAt)} Sri Lanka time.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <figure className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            <Image
              src={image.url}
              width={image.width}
              height={image.height}
              alt={image.alt}
              className="h-48 w-full object-cover sm:h-56"
              sizes="(max-width: 1024px) 100vw, 40vw"
              unoptimized
              priority
            />
            <figcaption className="bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Photo: {image.credit} ({image.license}) · <a href={image.source} target="_blank" rel="noreferrer" className="underline">Source</a>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Risk score
            </p>
            <p className="text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {district.score}
              <span className="text-lg font-normal text-slate-400"> / 100</span>
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full rounded-full ${meta.bar}`}
                style={{ width: `${district.score}%` }}
              />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Rain, next 24 h
              </dt>
              <dd className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {formatMm(district.rain24h)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Rain, next 72 h
              </dt>
              <dd className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {formatMm(district.rain72h)}
              </dd>
            </div>
          </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
