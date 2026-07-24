"use client";

import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { formatCurrency } from "@/lib/utils";

/** Compact dashboard tile — mirrors the Streak/10yr-projection tiles. */
export function ProtectedBadge({ amount, className }: { amount: number; className?: string }) {
  return (
    <div
      className={`bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-xl ${className ?? ""}`}
    >
      <p className="text-2xl font-black text-white tracking-tighter">
        $<AnimatedNumber value={Math.round(amount)} />
      </p>
      <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">Saved</p>
    </div>
  );
}

/** Inline "$X.XX protected from impulse spending" fragment, for use inside a sentence. */
export function ProtectedAmount({ amount, className }: { amount: number; className?: string }) {
  return <span className={className}>{formatCurrency(amount)}</span>;
}
