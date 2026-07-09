interface InsightListProps {
  insights: string[];
}

export function InsightList({ insights }: InsightListProps) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-5">
        Actionable Insights
      </h3>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li 
            key={i} 
            className="flex gap-4 items-start p-4 bg-zinc-900/40 border border-white/5 rounded-2xl hover:bg-zinc-800/40 transition-colors group"
          >
            <span className="mt-0.5 w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-blue-400 shadow-inner group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
              {i + 1}
            </span>
            <p className="text-zinc-300 text-sm leading-relaxed font-medium">
              {insight}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}