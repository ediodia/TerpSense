"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";

interface StreakBadgeProps {
  streak: number;
  justIncremented?: boolean;
  className?: string;
}

export function StreakBadge({ streak, justIncremented, className }: StreakBadgeProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!justIncremented || streak <= 0) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 1400);
    return () => clearTimeout(t);
  }, [justIncremented, streak]);

  return (
    <div
      className={`bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-xl transition-shadow duration-500 ${
        pulse ? "shadow-[0_0_35px_rgba(16,185,129,0.35)]" : ""
      } ${className ?? ""}`}
    >
      {pulse && (
        <span className="absolute -top-2 right-2 text-[10px] font-black text-emerald-400 animate-[fadeIn_0.3s_ease-out_forwards]">
          +1
        </span>
      )}
      <p
        className={`text-3xl font-black text-emerald-400 tracking-tighter transition-transform duration-500 ${
          pulse ? "scale-125" : "scale-100"
        }`}
      >
        🔥 <AnimatedNumber value={streak} />
      </p>
      <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">Streak</p>
    </div>
  );
}
