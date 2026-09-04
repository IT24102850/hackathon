/** Small display helpers shared by the board components. */

/** Rainfall with one decimal below 10mm, whole millimetres above it. */
export function formatMm(mm: number): string {
  return mm >= 10 ? `${Math.round(mm)} mm` : `${mm.toFixed(1)} mm`;
}

/**
 * "14:32, 4 Sep" in Sri Lanka time. Fixed to Asia/Colombo so a user abroad
 * still reads the timestamp the way the DMC would publish it.
 */
export function formatUpdatedAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "unknown";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Colombo",
    hour12: false,
  }).format(parsed);
}
