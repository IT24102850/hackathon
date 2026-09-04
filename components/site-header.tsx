"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Site navigation.
 *
 * Members adding a screen append one entry here and the header picks it up
 * on both desktop and mobile.
 */
const NAV_LINKS = [
  { href: "/#risk-board", label: "Risk board", id: "risk-board" },
  { href: "/#water-reports", label: "Water reports", id: "water-reports" },
  { href: "/#safe-centres", label: "Safe centres", id: "safe-centres" },
  { href: "/#problem", label: "The problem", id: "problem" },
];

export function SiteHeader() {
  const [activeSection, setActiveSection] = useState("risk-board");

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => link.id);
    const updateActiveSection = () => {
      const current = sections.reduce((active, id) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= 140 ? id : active;
      }, sections[0]);
      setActiveSection(current);
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

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
                  aria-current={activeSection === link.id ? "page" : undefined}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 ${activeSection === link.id ? "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300" : "text-slate-600 dark:text-slate-300"}`}
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
