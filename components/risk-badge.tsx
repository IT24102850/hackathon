import { RISK_BANDS } from "@/lib/risk";
import type { RiskBandId } from "@/lib/types";

/** Coloured pill naming a risk band. The colour is the band's own. */
export function RiskBadge({
  band,
  className = "",
}: {
  band: RiskBandId;
  className?: string;
}) {
  const meta = RISK_BANDS[band];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.chip} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {meta.label}
    </span>
  );
}
