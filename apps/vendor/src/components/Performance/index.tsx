import React from 'react';

interface PerformanceProps {
  name: string;
  /** Count for this band — shown at the right and used for the bar width. */
  value: number;
  /** Total ratings, so the bar fills proportionally (value / total). */
  total: number;
  color: string;
}

const Performance = ({ name, value, total, color }: PerformanceProps) => {
  // Bar width is this band's SHARE of all ratings — matching the reviews sheet.
  // (Previously the raw count was used as a percent, so bars were near-empty.)
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center w-full justify-between gap-3 my-2 text-[12px]">
      <div className="w-[22%] truncate font-medium">{name}</div>
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className={`${color} h-full rounded-full`}
            style={{ width: `${pct}%` }}
          ></div>
        </div>
      </div>
      <div className="w-[12%] text-right font-medium">{value}</div>
    </div>
  );
};

export default Performance;
