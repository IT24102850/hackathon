import Link from "next/link";

/**
 * Site navigation.
 *
 * Members adding a screen append one entry here and the header picks it up
 * on both desktop and mobile.
 */
const NAV_LINKS = [
  { href: "/", label: "Risk board" },
  { href: "/#problem", label: "The problem" },
  { href: "/#method", label: "How scoring works" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2.6c3.6 4.2 6 7.6 6 10.4a6 6 0 1 1-12 0c0-2.8 2.4-6.2 6-10.4Z" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-900 dark:text-slate-50">
              FloodWatch LK
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              District flood &amp; landslide risk
            </span>
          </span>
        </Link>

        <nav aria-label="Main">
          <ul className="-mx-1 flex items-center gap-1 overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
