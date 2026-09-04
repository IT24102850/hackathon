import { RiskBoard } from "@/components/risk-board";
import { CommunityAndCentres } from "@/components/community-and-centres";
import {
  BANDS_BY_SEVERITY,
  RAIN_24H_CAP_MM,
  RAIN_72H_CAP_MM,
} from "@/lib/risk";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <section className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          Flood and landslide risk, district by district
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Every district in Sri Lanka is scored from the next three days of
          forecast rainfall and how badly that district floods when it rains.
          One number, one band, one instruction — so a family does not have to
          translate a millimetre figure into a decision.
        </p>
      </section>

      <section id="risk-board" className="scroll-mt-24">
        <RiskBoard />
      </section>

      <CommunityAndCentres />

      <ProblemSection />
      <MethodSection />
    </main>
  );
}

/** Requirement 2: the Sri Lankan problem, explained inside the app. */
function ProblemSection() {
  return (
    <section id="problem" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
        The problem we are solving
      </h2>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Sri Lanka floods twice a year on a schedule. The south-west monsoon
            fills the Kelani and Kalu river basins between May and September,
            and the north-east monsoon soaks the Eastern Province from December
            to February. When the rain lands on the steep, deforested slopes of
            Sabaragamuwa and the central hills, the same districts fail the same
            way: Ratnapura goes under water, Kegalle and Nuwara Eliya slide, and
            Kolonnawa and Kelaniya in Colombo back up because the drains cannot
            discharge into a full river.
          </p>
          <p>
            The May 2016 landslide at Aranayake in Kegalle took more than a
            hundred lives. A year later the Kalu Ganga floods displaced hundreds
            of thousands across Ratnapura, Kalutara, Galle and Matara. Both
            events were forecast. Heavy rainfall warnings were issued by the
            Department of Meteorology and the Disaster Management Centre before
            the water arrived.
          </p>
          <p>
            The gap is not prediction, it is translation. Official bulletins are
            published as regional rainfall figures — &ldquo;falls above 150 mm
            in the Sabaragamuwa Province&rdquo; — and a household has to work
            out on its own whether that means watch, pack, or leave. People who
            have been flooded before over-read it and lose days of work. People
            who have not under-read it and leave too late.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Who this is for
          </h3>
          <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                Families in low-lying wards
              </strong>{" "}
              of Ratnapura and Kalutara along the Kalu Ganga, who need to know
              tonight whether to move upstairs.
            </li>
            <li>
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                Estate and smallholder households
              </strong>{" "}
              on the slopes of Kegalle, Nuwara Eliya and Badulla, where a third
              wet day matters more than a heavy first one.
            </li>
            <li>
              <strong className="font-semibold text-slate-900 dark:text-slate-100">
                Grama Niladhari officers
              </strong>
              , who must decide when to open a safe centre and would rather read
              one ranked list than 25 separate forecasts.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/** How the score is built. Kept on the page so the number is never a mystery. */
function MethodSection() {
  return (
    <section id="method" className="mt-16 scroll-mt-24">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
        How the score is calculated
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        One request to the Open-Meteo forecast API returns the daily rainfall
        forecast for all 25 district capitals. Each district is then scored out
        of 100 from three parts.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <MethodCard
          weight="50"
          title="Rain in the next 24 hours"
          body={`Capped at ${RAIN_24H_CAP_MM} mm. Flash flooding in the Kelani and Kalu basins follows a single very heavy day, so this term carries the most weight.`}
        />
        <MethodCard
          weight="30"
          title="Rain over the next 72 hours"
          body={`Capped at ${RAIN_72H_CAP_MM} mm. Catches the slower failure, where ground is already saturated and a modest extra fall starts a landslide.`}
        />
        <MethodCard
          weight="20"
          title="District vulnerability"
          body="A fixed 0 to 1 weighting for terrain, drainage and past flood history. It is why a dry Ratnapura still outranks a dry Vavuniya."
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">
            Risk bands, their score ranges and the action each one calls for
          </caption>
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Band
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Score
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                What it means
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {BANDS_BY_SEVERITY.map((band, index) => {
              const upper = BANDS_BY_SEVERITY[index - 1];
              return (
                <tr key={band.id}>
                  <th scope="row" className="whitespace-nowrap px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${band.dot}`}
                        aria-hidden
                      />
                      {band.label}
                    </span>
                  </th>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                    {upper ? `${band.min} – ${upper.min - 1}` : `${band.min}+`}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {band.headline}.
                    </span>{" "}
                    {band.instruction}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Worked example. Ratnapura carries a vulnerability of 0.92, so it starts
        at 18 of a possible 20 on that term alone. Give it 150 mm of rain
        tomorrow and 300 mm across three days and both rainfall terms cap out,
        putting it at 98 and firmly in the Severe band.
      </p>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Prototype limitations: forecasts come from Open-Meteo at district
        capitals, vulnerability is a fixed heuristic, safe-centre occupancy is
        sample data, and community reports are stored only in this browser.
        This tool does not replace official warnings or emergency services.
      </p>
    </section>
  );
}

function MethodCard({
  weight,
  title,
  body,
}: {
  weight: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-3xl font-bold tabular-nums text-sky-600 dark:text-sky-400">
        {weight}
        <span className="text-base font-medium text-slate-400"> pts</span>
      </p>
      <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {body}
      </p>
    </div>
  );
}
