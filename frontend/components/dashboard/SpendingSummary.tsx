import { formatCurrency } from "@/lib/utils";
import type { SpendingSummary } from "@/types";

interface SpendingSummaryProps {
  summary: SpendingSummary;
}

const CATEGORY_ICONS: Record<string, string> = {
  Clothing: "👕",
  Food: "🍔",
  Dining: "🍔",
  Entertainment: "🎬",
  Transport: "🚗",
  Subscriptions: "📱",
  Health: "💊",
  Shopping: "🛍️",
  Other: "•",
};

export function SpendingSummaryCard({ summary }: SpendingSummaryProps) {
  const categories = Object.entries(summary.week ?? {}).sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-transparent p-6 h-full flex flex-col">
      <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-5">This Week's Spending</p>
      
      <div className="space-y-4 flex-1">
        {categories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <span className="text-xl mb-1">🛡️</span>
            <p className="text-xs text-zinc-500 font-medium">No expenses logged yet this week.</p>
          </div>
        ) : (
          categories.map(([category, amount]) => {
            const weekAvg = summary.category_weekly_averages?.[category] ?? 0;
            const isOver = amount > weekAvg && weekAvg > 0;
            
            // Ensures active spending retains at least a 5% fallback visual width rather than disappearing
            const calculatedWidth = weekAvg > 0 ? Math.round((amount / (weekAvg * 2.5)) * 100) : 20;
            const barWidth = Math.max(5, Math.min(100, calculatedWidth));

            return (
              <div key={category} className="group relative">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-80">{CATEGORY_ICONS[category] ?? "•"}</span>
                    <span className="text-sm font-bold text-zinc-200 tracking-tight">{category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isOver && (
                      <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-md">
                        Over Avg
                      </span>
                    )}
                    <span className="text-sm font-bold text-white">{formatCurrency(amount)}</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-950 border border-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isOver ? "bg-orange-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total this week</span>
        <span className="text-base font-black text-white">
          {formatCurrency(summary.total_week ?? 0)}
        </span>
      </div>
    </div>
  );
}