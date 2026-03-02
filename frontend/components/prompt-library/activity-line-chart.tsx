"use client";

import { useMemo } from "react";

type ActivityLineChartProps = {
  data: number[];
  className?: string;
  strokeWidth?: number;
};

export function ActivityLineChart({
  data,
  className = "",
  strokeWidth = 1.25,
}: ActivityLineChartProps) {
  const { path, width, height } = useMemo(() => {
    const w = 80;
    const h = 20;
    if (data.length < 2) return { path: "", width: w, height: h };

    const min = Math.min(...data);
    const max = Math.max(...data);
    if (min === max) return { path: "", width: w, height: h };
    const range = max - min || 1;
    const padding = 1;

    const points = data.map((value, i) => {
      const x = padding + (i / (data.length - 1)) * (w - padding * 2);
      const y = h - padding - ((value - min) / range) * (h - padding * 2);
      return `${x},${y}`;
    });

    return {
      path: `M ${points.join(" L ")}`,
      width: w,
      height: h,
    };
  }, [data]);

  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) return null;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
        className="text-emerald-500"
      />
    </svg>
  );
}
