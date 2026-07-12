"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type BarColor = "emerald" | "yellow" | "orange" | "red" | "blue" | "purple";

interface ProgressBarProps {
  value: number; // 0–100
  animated?: boolean;
  color?: BarColor;
  className?: string;
  showLabel?: boolean;
  /** Two-tone gradient fill with a subtle moving shimmer, matching GoalCard's progress style */
  gradient?: boolean;
  /** Track/bar thickness */
  size?: "sm" | "md" | "lg";
}

const colorClasses: Record<BarColor, string> = {
  emerald: "bg-emerald-500",
  yellow: "bg-yellow-400",
  orange: "bg-orange-400",
  red: "bg-red-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
};

const gradientClasses: Record<BarColor, string> = {
  emerald: "bg-gradient-to-r from-emerald-500 to-teal-400",
  yellow: "bg-gradient-to-r from-yellow-400 to-amber-300",
  orange: "bg-gradient-to-r from-orange-500 to-amber-400",
  red: "bg-gradient-to-r from-red-500 to-rose-400",
  blue: "bg-gradient-to-r from-blue-500 to-cyan-400",
  purple: "bg-gradient-to-r from-purple-500 to-fuchsia-400",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  animated = false,
  color = "emerald",
  className,
  showLabel = false,
  gradient = false,
  size = "md",
}: ProgressBarProps) {
  const [displayed, setDisplayed] = useState(animated ? Math.max(0, value - 10) : value);

  useEffect(() => {
    if (!animated) {
      setDisplayed(value);
      return;
    }
    // Small delay so the animation is visible on mount
    const timer = setTimeout(() => setDisplayed(value), 150);
    return () => clearTimeout(timer);
  }, [value, animated]);

  const clamped = Math.min(100, Math.max(0, displayed));

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-zinc-950 border border-white/5 rounded-full overflow-hidden shadow-inner", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all ease-out relative",
            gradient ? gradientClasses[color] : colorClasses[color],
            animated && "duration-1000"
          )}
          style={{ width: `${clamped}%` }}
        >
          {gradient && (
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full" />
          )}
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-500 mt-1 inline-block">{Math.round(clamped)}%</span>
      )}
    </div>
  );
}