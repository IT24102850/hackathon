/** Emergency numbers, attribution and the scope disclaimer. */

const HOTLINES = [
  { label: "Disaster Management Centre", number: "117" },
  { label: "Ambulance / Suwa Seriya", number: "1990" },
  { label: "Police emergency", number: "119" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            If you are in danger now
          </h2>
          <ul className="mt-3 space-y-2">
            {HOTLINES.map((line) => (
              <li
                key={line.number}
                className="flex items-baseline justify-between gap-4 text-sm"
              >
                <span className="text-slate-600 dark:text-slate-300">
                  {line.label}
                </span>
                <a
                  href={`tel:${line.number}`}
                  className="font-bold tabular-nums text-sky-700 hover:underline dark:text-sky-400"
                >
                  {line.number}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            About this board
          </h2>
          <p className="mt-3">
            Rainfall forecasts come from the{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-700 hover:underline dark:text-sky-400"
            >
              Open-Meteo
            </a>{" "}
            public API. Risk scores are our own calculation, not an official
            forecast.
          </p>
          <p className="mt-2">
            This is a student project for SE3090 and does not replace warnings
            from the Disaster Management Centre or the National Building
            Research Organisation. Always follow official instructions.
          </p>
        </div>
      </div>
    </footer>
  );
}
