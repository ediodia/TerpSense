import { formatCurrency, pluralize } from "@/lib/utils";
import type { Goal } from "@/types";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const percent = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  return (
    <div className="bg-transparent p-6 h-full flex flex-col justify-center">
      <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-4">Savings Goal</p>
      
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{goal.name}</h3>
          <p className="text-sm font-medium text-zinc-500 mt-0.5">
            {remaining === 0 ? "Goal achieved" : `${formatCurrency(remaining)} to go`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-emerald-400">{percent}%</span>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Funded</p>
        </div>
      </div>

      <div className="w-full bg-zinc-950 border border-white/5 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full" />
        </div>
      </div>

      <div className="flex justify-between text-sm mt-1 mb-4">
        <span className="text-zinc-400">
          <span className="text-zinc-100 font-bold">{formatCurrency(goal.current_amount)}</span> saved
        </span>
        <span className="text-zinc-400">
          goal <span className="text-zinc-100 font-bold">{formatCurrency(goal.target_amount)}</span>
        </span>
      </div>

      <div className="flex items-center justify-between text-xs font-medium bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 mt-auto">
        <span className="text-zinc-400">Current Velocity</span>
        <span className="text-zinc-200">
          {remaining === 0 ? (
            <span className="text-emerald-400 font-bold">Completed</span>
          ) : (
            <>
              <span className="text-white font-bold">
                {goal.days_to_goal_at_current_pace} {pluralize(goal.days_to_goal_at_current_pace, "day")}
              </span>{" "}
              to completion
            </>
          )}
        </span>
      </div>
    </div>
  );
}