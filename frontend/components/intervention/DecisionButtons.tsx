'use client';

interface DecisionButtonsProps {
  hasAlternative: boolean;
  onDecision: (type: "proceed" | "delay" | "redirect" | "alternative") => void;
  isSubmitting: boolean;
}

export default function DecisionButtons({ hasAlternative, onDecision, isSubmitting }: DecisionButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <button 
        onClick={() => onDecision('redirect')} 
        disabled={isSubmitting}
        className="bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all rounded-xl p-3 text-left group flex flex-col gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform text-sm">🎯</div>
        <div>
          <span className="block text-xs font-bold text-white tracking-tight">Redirect to Savings</span>
          <span className="block text-[9px] text-zinc-500">Put this money toward your goal</span>
        </div>
      </button>

      <button 
        onClick={() => onDecision('delay')} 
        disabled={isSubmitting}
        className="bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all rounded-xl p-3 text-left group flex flex-col gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform text-sm">⏳</div>
        <div>
          <span className="block text-xs font-bold text-white tracking-tight">Wait 7 Days</span>
          <span className="block text-[9px] text-zinc-500">Come back if you still want it</span>
        </div>
      </button>

      <button 
        onClick={() => hasAlternative && onDecision('alternative')} 
        disabled={!hasAlternative || isSubmitting}
        className={`bg-zinc-900/40 border border-white/5 transition-all rounded-xl p-3 text-left flex flex-col gap-1.5 ${hasAlternative && !isSubmitting ? 'hover:border-purple-500/30 hover:bg-purple-500/10 group' : 'opacity-40 cursor-not-allowed'}`}
      >
        <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform text-sm">🔍</div>
        <div>
          <span className="block text-xs font-bold text-white tracking-tight">See Alternative</span>
          <span className="block text-[9px] text-zinc-500">Find a better deal</span>
        </div>
      </button>

      <button 
        onClick={() => onDecision('proceed')} 
        disabled={isSubmitting}
        className="bg-zinc-900/40 border border-white/5 hover:border-zinc-500/30 hover:bg-zinc-800 transition-all rounded-xl p-3 text-left group flex flex-col gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform text-sm">↗</div>
        <div>
          <span className="block text-xs font-bold text-white tracking-tight">Proceed Anyway</span>
          <span className="block text-[9px] text-zinc-500">I have considered this</span>
        </div>
      </button>
    </div>
  );
}