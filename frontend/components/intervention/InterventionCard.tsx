import { formatCurrency, pluralize } from "@/lib/utils";
import type { Decision, InterventionResult } from "@/types";
import { SeverityBadge } from "./SeverityBadge";
import { InsightList } from "./InsightList";
import { DecisionButtons } from "./DecisionButtons";

const severityBorderColors = {
  yellow: "border-yellow-500/30",
  orange: "border-orange-500/40",
  red: "border-red-500/40",
};

const severityGlowColors = {
  yellow: "shadow-[0_0_40px_rgba(234,179,8,0.15)]",
  orange: "shadow-[0_0_40px_rgba(249,115,22,0.15)]",
  red: "shadow-[0_0_40px_rgba(239,68,68,0.15)]",
};

const severityGradients = {
  yellow: "from-yellow-500/10",
  orange: "from-orange-500/10",
  red: "from-red-500/10",
};

interface InterventionCardProps {
  result: InterventionResult;
  purchaseAmount: number;
  merchant?: string;
  onDecision: (decision: Decision) => void;
}

export function InterventionCard({
  result,
  purchaseAmount,
  merchant,
  onDecision,
}: InterventionCardProps) {
  const { severity, insights, goal_impact_days, redirect_value_6mo, alternative_suggestion, summary_line } = result;

  return (
    <div
      className={`relative bg-zinc-900/40 backdrop-blur-xl border ${severityBorderColors[severity]} ${severityGlowColors[severity]} rounded-3xl overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${severityGradients[severity]} via-transparent to-transparent pointer-events-none opacity-50`} />
      
      <div className="relative z-10">
        <div className="px-8 pt-8 pb-6 border-b border-white/5 bg-zinc-900/20">
          <div className="flex items-start justify-between mb-4">
            <SeverityBadge severity={severity} />
            <span className="text-3xl font-black text-white tracking-tight">{formatCurrency(purchaseAmount)}</span>
          </div>
          {merchant && (
            <p className="text-sm font-medium text-zinc-500 mb-2">
              Pending purchase at <span className="text-zinc-200 font-bold">{merchant}</span>
            </p>
          )}
          <p className="text-base font-medium text-zinc-300 leading-relaxed">{summary_line}</p>
        </div>

        <div className="px-8 py-6 border-b border-white/5">
          <InsightList insights={insights} />
        </div>

        <div className="px-8 py-6 border-b border-white/5 grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/40 transition-colors group">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Goal delayed by</p>
            <p className="text-2xl font-black text-red-400 group-hover:scale-105 transition-transform origin-left">
              {goal_impact_days}{" "}
              <span className="text-sm font-bold text-red-400/70">{pluralize(goal_impact_days, "day")}</span>
            </p>
          </div>
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:bg-zinc-800/40 transition-colors group">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Redirect value (6mo)</p>
            <p className="text-2xl font-black text-emerald-400 group-hover:scale-105 transition-transform origin-left">
              {formatCurrency(redirect_value_6mo)}
            </p>
          </div>
        </div>

        {alternative_suggestion && (
          <div className="px-8 py-6 border-b border-white/5">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-xl bg-purple-500/20 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">💡</span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-purple-400 mb-1.5">
                  Better option
                </p>
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">{alternative_suggestion}</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-8 py-8 bg-zinc-900/20">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">
            What do you want to do?
          </p>
          <DecisionButtons
            onDecision={onDecision}
            hasAlternative={!!alternative_suggestion}
          />
        </div>
      </div>
    </div>
  );
}