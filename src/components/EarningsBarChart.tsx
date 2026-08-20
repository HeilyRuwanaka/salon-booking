"use client";

import type { ChartPoint, ReportRange } from "@/lib/reports";

type Props = {
  points: ChartPoint[];
  range: ReportRange;
};

function formatShortLkr(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export function EarningsBarChart({ points, range }: Props) {
  const max = Math.max(...points.map((p) => p.earningsLkr), 0);
  const chartTitle =
    range === "day" ? "Earnings by hour" : range === "week" ? "Earnings by day" : "Earnings by date";
  const barMaxPx = 112;

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-semibold">{chartTitle}</p>
        <p className="text-xs text-mute">LKR · completed</p>
      </div>

      {max === 0 ? (
        <p className="mt-6 pb-2 text-center text-sm text-mute">
          No completed earnings in this period.
        </p>
      ) : (
        <div className="mt-3 flex items-end gap-0.5 sm:gap-1" role="img" aria-label={chartTitle}>
          {points.map((p, i) => {
            const h =
              p.earningsLkr > 0
                ? Math.max(4, Math.round((p.earningsLkr / max) * barMaxPx))
                : 0;
            const showLabel =
              range !== "month" ||
              Number(p.label) === 1 ||
              Number(p.label) % 5 === 0 ||
              i === points.length - 1;

            return (
              <div key={p.key} className="flex min-w-0 flex-1 flex-col items-center">
                <span className="mb-1 h-3 max-w-full truncate text-[10px] leading-none text-mute">
                  {p.earningsLkr > 0 ? formatShortLkr(p.earningsLkr) : ""}
                </span>
                <div
                  className="w-full max-w-[28px] rounded-t-md bg-copper"
                  style={{ height: `${h}px` }}
                  title={`${p.label}: LKR ${p.earningsLkr.toLocaleString("en-LK")}`}
                />
                <span
                  className={`mt-1.5 text-[10px] leading-none ${
                    showLabel ? "text-mute" : "invisible"
                  }`}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
