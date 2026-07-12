"use client";

import { useEffect, useState } from "react";

export function SpendingGauge({ spent, budget }: { spent: number; budget: number }) {
  const [animated, setAnimated] = useState(0);
  const percent = Math.min(100, Math.round((spent / budget) * 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animated / 100) * circumference;
  const color = percent > 80 ? "#ef4444" : percent > 60 ? "#f97316" : "#10b981";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 300);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-center gap-4 h-full relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#27272a" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.3s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white">{percent}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Biweekly Budget</p>
          <p className="text-2xl font-black text-white tracking-tight">${spent.toFixed(2)}</p>
          <p className="text-sm font-medium text-zinc-400">of ${budget}</p>
          <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/5">
            {percent > 80 ? (
              <span className="text-xs text-red-400 font-bold">🚨 Almost out</span>
            ) : percent > 60 ? (
              <span className="text-xs text-orange-400 font-bold">⚠️ Slow down</span>
            ) : (
              <span className="text-xs text-emerald-400 font-bold">Core budget on track</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}