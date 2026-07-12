"use client";

import { ProgressBar } from "@/components/ui/ProgressBar";

export function XPBadge({ xp = 75 }: { xp?: number }) {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 relative overflow-hidden shadow-2xl">
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Financial IQ</span>
        <span className="text-sm font-black text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md">Lvl {level}</span>
      </div>
      <div className="relative z-10">
        <ProgressBar value={progress} animated gradient size="lg" color="blue" />
      </div>
      <p className="text-xs font-medium text-zinc-500 mt-2 relative z-10">{progress}/100 XP to Level {level + 1}</p>
    </div>
  );
}