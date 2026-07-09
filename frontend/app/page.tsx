'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

interface SeverityBadgeProps {
  severity: 'yellow' | 'orange' | 'red';
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = {
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", label: "Heads Up" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", label: "WATCH OUT" },
    red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", label: "Risky Move" },
  };
  const currentConfig = config[severity] || config.orange;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-zinc-900/60 ${currentConfig.border}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
      <span className={`text-[10px] font-black uppercase tracking-wider ${currentConfig.text}`}>{currentConfig.label}</span>
    </div>
  );
}

export default function InterventionPage() {
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [streak, setStreak] = useState(3);
  const [protectedCapital, setProtectedCapital] = useState(284.00);
  const [currentScreen, setCurrentScreen] = useState<'analysis' | 'anim-redirect' | 'anim-delay' | 'anim-alternative' | 'anim-proceed' | 'summary'>('analysis');
  const [chosenAction, setChosenAction] = useState<string | null>(null);

  const [purchase] = useState({ amount: 100.00, merchant: "ASOS", category: "Clothing" });
  const [analysis] = useState({
    severity: "orange" as const,
    insights: [
      "You have spent $143.00 on Clothing this week. This purchase would bring it to $243.00.",
      "This purchase would delay your Emergency Fund goal by 32 days."
    ],
    goal_impact_days: 32,
    redirect_value_6mo: 102.50,
    alternative_suggestion: "Similar items are often available on ThredUp or Depop for 50-70% less."
  });

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I flagged this transaction based on your current trajectory. Ask me anything like can I afford this or what is the alternative.' }
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages]);

  const handleDecision = (type: "proceed" | "delay" | "redirect" | "alternative") => {
    setChosenAction(type);
    setCurrentScreen(`anim-${type}` as any);

    setTimeout(() => {
      if (type === 'proceed') {
        setStreak(0);
      } else {
        setStreak(prev => prev + 1);
        setProtectedCapital(prev => prev + purchase.amount);
      }
      setCurrentScreen('summary');
    }, 3200);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    let replyText = "Query indexed. Retaining your streak pays greater rewards over standard linear consumption lines.";
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('afford')) {
      replyText = "It pushes milestones back by 32 days. Diverting this transaction keeps target trajectories safe.";
    } else if (lowerText.includes('alternative') || lowerText.includes('deal')) {
      replyText = "Depop and similar alternative platforms offer verified matches for roughly 60% less.";
    } else if (lowerText.includes('yield') || lowerText.includes('project')) {
      replyText = "Compounding alternative index protocols suggest an estimated yield of +$259.37 over a 10-year curve.";
    }

    setMessages(prev => [
      ...prev, 
      { role: 'user', content: text },
      { role: 'assistant', content: replyText }
    ]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
    setInput('');
  };

  return (
    <main className="w-full min-h-screen bg-[#09090b] text-white font-sans p-6 selection:bg-emerald-500/30">
      
      {/* Keyframe Configurations for Custom Micro-Interactions */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(380px) rotate(720deg); opacity: 0; }
        }
        @keyframes sandStream {
          0% { transform: scaleY(0); opacity: 0.3; }
          15% { transform: scaleY(1); opacity: 1; }
          85% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0); opacity: 0; }
        }
        @keyframes sandFill {
          0% { height: 0px; }
          100% { height: 24px; }
        }
        @keyframes sandEmpty {
          0% { height: 24px; }
          100% { height: 0px; }
        }
        @keyframes lensReveal {
          0% { transform: scale(0.6); opacity: 0; }
          30% { transform: scale(1.1); opacity: 1; }
          70% { transform: scale(1); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1.8); opacity: 0; filter: blur(4px); }
        }
        @keyframes dynamicScan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes signRunIn {
          0% { transform: translateX(-140%) scale(0.95); }
          40% { transform: translateX(-5%) scale(1); }
          55% { transform: translateX(0%) scale(1); }
          100% { transform: translateX(160%) scale(1.05); }
        }
        .animate-confetti { animation: confettiFall 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; }
        .animate-stream { animation: sandStream 3.2s linear infinite; transform-origin: top; }
        .animate-filling { animation: sandFill 3.2s linear forwards; }
        .animate-emptying { animation: sandEmpty 3.2s linear forwards; }
        .animate-lens { animation: lensReveal 3.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-scanning { animation: dynamicScan 1.6s ease-in-out infinite; }
        .animate-signRun { animation: signRunIn 2.8s cubic-bezier(0.76, 0, 0.24, 1) forwards; }
      `}</style>

      <div className="max-w-[1300px] mx-auto space-y-4">
        
        {/* Header Block */}
        <div className="flex items-center gap-3">
          <Link href="/" className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors cursor-pointer text-xs font-bold">
            ←
          </Link>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-100">Intervention Analysis</h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">Automated risk assessment by TerpSense</p>
          </div>
        </div>

        {/* Dense Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LEFT PANEL: INTERVENTION SYSTEM ENGINE */}
          <div className="lg:col-span-5 bg-zinc-950 border border-white/10 rounded-2xl p-5 min-h-[560px] flex flex-col justify-between relative overflow-hidden shadow-xl">
            
            {/* COMPONENT LAYER 1: PIPELINE EVALUATION STACK */}
            {currentScreen === 'analysis' && (
              <div className="flex-1 flex flex-col justify-between gap-4">
                
                <div className="flex justify-between items-center">
                  <SeverityBadge severity={analysis.severity} />
                  <span className="text-2xl font-black text-white tracking-tight">{formatCurrency(purchase.amount)}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-zinc-500 font-bold">Pending purchase at <span className="text-zinc-200">{purchase.merchant}</span></p>
                  <p className="text-[12px] text-zinc-300 leading-relaxed font-semibold">
                    Redirecting this $100.00 to savings could grow to $102.50 in 6 months.
                  </p>
                </div>

                {/* Compact Actionable Insights Accordion */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Actionable Insights</p>
                  <div className="space-y-1.5">
                    {analysis.insights.map((insight, idx) => (
                      <div key={`insight-${idx}`} className="bg-zinc-900/40 border border-white/5 p-3 rounded-xl flex items-start gap-3">
                        <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-[11px] text-zinc-400 font-medium leading-normal">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Trajectory Blocks */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/30 border border-white/5 p-3 rounded-xl">
                    <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-0.5">Goal Delayed By</span>
                    <span className="text-lg font-black text-red-400 tracking-tight">{analysis.goal_impact_days} Days</span>
                  </div>
                  <div className="bg-zinc-900/30 border border-white/5 p-3 rounded-xl">
                    <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wide mb-0.5">Redirect Value (6mo)</span>
                    <span className="text-lg font-black text-emerald-400 tracking-tight">{formatCurrency(analysis.redirect_value_6mo)}</span>
                  </div>
                </div>

                {/* Recommended Marketplace Alternatives */}
                <div className="bg-purple-950/10 border border-purple-500/20 p-3 rounded-xl flex items-start gap-2.5">
                  <span className="text-sm mt-0.5">💡</span>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-purple-400 tracking-widest mb-0.5">Better Option</span>
                    <p className="text-[11px] text-zinc-400 leading-normal font-medium">{analysis.alternative_suggestion}</p>
                  </div>
                </div>

                {/* Compact Controller System */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">What do you want to do?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleDecision('redirect')} className="bg-zinc-900/70 hover:bg-emerald-950/20 border border-white/5 hover:border-emerald-500/30 p-2.5 rounded-xl text-left transition-all group">
                      <span className="block text-[11px] font-bold text-emerald-400">🎯 Redirect Savings</span>
                      <span className="block text-[9px] text-zinc-500 group-hover:text-zinc-400">Compound portfolio goals</span>
                    </button>
                    <button onClick={() => handleDecision('delay')} className="bg-zinc-900/70 hover:bg-blue-950/20 border border-white/5 hover:border-blue-500/30 p-2.5 rounded-xl text-left transition-all group">
                      <span className="block text-[11px] font-bold text-blue-400">⏳ Wait 7 Days</span>
                      <span className="block text-[9px] text-zinc-500 group-hover:text-zinc-400">Cool off impulse target</span>
                    </button>
                    <button onClick={() => handleDecision('alternative')} className="bg-zinc-900/70 hover:bg-purple-950/20 border border-white/5 hover:border-purple-500/30 p-2.5 rounded-xl text-left transition-all group">
                      <span className="block text-[11px] font-bold text-purple-400">🔍 See Alternative</span>
                      <span className="block text-[9px] text-zinc-500 group-hover:text-zinc-400">Find marketplace deals</span>
                    </button>
                    <button onClick={() => handleDecision('proceed')} className="bg-zinc-900/70 hover:bg-zinc-800 border border-white/5 hover:border-zinc-500/30 p-2.5 rounded-xl text-left transition-all group">
                      <span className="block text-[11px] font-bold text-zinc-300">↗ Proceed Anyway</span>
                      <span className="block text-[9px] text-zinc-500 group-hover:text-zinc-400">Force immediate exit bypass</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* SCREEN 2: GREEN CONFETTI SHOWER ANIMATION */}
            {currentScreen === 'anim-redirect' && (
              <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
                {[...Array(35)].map((_, i) => {
                  const size = Math.random() * 4 + 4;
                  const leftPos = Math.random() * 100;
                  const delay = Math.random() * 1.5;
                  const duration = Math.random() * 1.2 + 1.5;
                  return (
                    <div 
                      key={`confetti-${i}`} 
                      className="absolute bg-emerald-400 rounded-sm opacity-90 animate-confetti" 
                      style={{ 
                        left: `${leftPos}%`, 
                        top: `-20px`, 
                        width: `${size}px`, 
                        height: `${size * 2}px`,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`
                      }}
                    />
                  );
                })}
                <div className="text-center relative z-10 space-y-3 bg-zinc-950/80 p-6 rounded-2xl border border-emerald-500/10 backdrop-blur-sm">
                  <span className="inline-block text-4xl p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse">🎯</span>
                  <h3 className="text-base font-black text-emerald-400 tracking-widest uppercase">CAPITAL REDIRECT SECURED</h3>
                  <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed font-medium">Depositing $100.00 directly into reserve pipelines. Compounding active wealth protocols...</p>
                </div>
              </div>
            )}

            {/* SCREEN 3: DUAL-BULB HOURGLASS SAND POURING ANIMATION */}
            {currentScreen === 'anim-delay' && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <div className="w-16 h-28 border-2 border-zinc-700 bg-zinc-900/60 rounded-xl relative p-1 flex flex-col justify-between items-center shadow-inner backdrop-blur-md">
                  {/* Top Chamber */}
                  <div className="w-full h-10 bg-amber-500/30 rounded-b-[70%] border-b border-zinc-800 overflow-hidden relative">
                    <div className="w-full bg-amber-400 absolute bottom-0 left-0 animate-emptying shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                  </div>
                  {/* Active Trickling Sand Stream */}
                  <div className="w-[3px] h-10 bg-amber-400/90 absolute top-11 z-20 animate-stream shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  {/* Bottom Chamber */}
                  <div className="w-full h-10 bg-zinc-950 rounded-t-[70%] overflow-hidden relative flex items-end">
                    <div className="w-full bg-amber-500/80 animate-filling shadow-[0_-2px_12px_rgba(251,191,36,0.5)]" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xs font-black text-blue-400 tracking-widest uppercase">7-Day Cooling Cooldown Engaged</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Braking emotional impulse triggers. Standby...</p>
                </div>
              </div>
            )}

            {/* SCREEN 4: WORKING LENS SCANNER ZOOM */}
            {currentScreen === 'anim-alternative' && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] overflow-hidden relative">
                {/* Micro focus matrix lines */}
                <div className="absolute inset-x-8 top-[35%] bottom-[35%] border-y border-purple-500/20 pointer-events-none">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent absolute animate-scanning" />
                </div>
                {/* Lens Container */}
                <div className="animate-lens flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">🔍</div>
                  <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md text-[9px] font-bold uppercase tracking-widest text-purple-400">
                    Scanning Listings
                  </div>
                </div>
                <h3 className="text-xs font-black text-purple-400 tracking-widest uppercase absolute bottom-12">Querying Marketplace Aggregators</h3>
              </div>
            )}

            {/* SCREEN 5: JAPANESE EMERGENCY EXIT RUNNING SIGN */}
            {currentScreen === 'anim-proceed' && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-[#050506] relative overflow-hidden">
                {/* The iconic bright green exit door box sign */}
                <div className="w-44 h-24 bg-[#00a651] rounded border-[4px] border-white flex flex-col justify-between p-2 relative shadow-[0_0_30px_rgba(0,166,81,0.35)] overflow-hidden">
                  <div className="flex justify-between items-center text-white font-black tracking-widest text-[9px] select-none border-b border-white/20 pb-0.5">
                    <span>非常口</span>
                    <span>EXIT</span>
                  </div>
                  {/* High-fidelity running silhouette crossing the green box */}
                  <div className="animate-signRun text-4xl font-black text-white absolute bottom-2 left-0 select-none drop-shadow-md">
                    🏃‍♂️💨
                  </div>
                </div>
                <div className="text-center mt-6 space-y-1 relative z-10">
                  <h3 className="text-xs font-black text-red-500 tracking-widest uppercase">System Guardrail Overridden</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Bypassing algorithmic buffers. Routing exit path...</p>
                </div>
              </div>
            )}

            {/* SCREEN 6: CONTENT-DENSE SYSTEM RECOVERY SUMMARY */}
            {currentScreen === 'summary' && (
              <div className="flex-1 flex flex-col justify-between gap-4 animate-fade-in">
                
                <div className="space-y-3">
                  <div className="bg-zinc-900 border border-white/10 p-3.5 rounded-xl flex items-center gap-3 shadow-inner">
                    <span className="text-2xl p-2 bg-zinc-950 rounded-lg border border-white/5">
                      {chosenAction === 'proceed' ? '📉' : '🎉'}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-zinc-200">
                        {chosenAction === 'proceed' ? 'Ecosystem Safeguards Overridden' : 'Ecosystem Capital Protected'}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-medium leading-normal mt-0.5">
                        {chosenAction === 'redirect' && 'Transferred $100.00 directly into strategic yield portfolios.'}
                        {chosenAction === 'delay' && '7-day validation cooldown locked into security buffers.'}
                        {chosenAction === 'alternative' && 'Alternative marketplace items indexed and matched.'}
                        {chosenAction === 'proceed' && 'Asset balance depleted. Multiplier targets reset down to baseline.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl text-center shadow-sm">
                      <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider mb-1">Adjusted Streak Status</span>
                      <span className={`text-2xl font-black tracking-tight ${streak === 0 ? 'text-red-500' : 'text-white'}`}>{streak} Days</span>
                      <p className="text-[9px] text-zinc-600 mt-1 font-medium">{streak === 0 ? 'Reset to baseline' : 'Multiplier remains healthy'}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl text-center shadow-sm">
                      <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider mb-1">Protected Reserves</span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tight">{formatCurrency(protectedCapital)}</span>
                      <p className="text-[9px] text-emerald-500/50 mt-1 font-medium">Safe from impulse exits</p>
                    </div>
                  </div>

                  {/* Dense Context Box to completely eliminate empty space */}
                  <div className="bg-zinc-950 border border-white/5 p-3 rounded-xl space-y-2">
                    <span className="block text-[8px] font-black uppercase text-zinc-500 tracking-wider">Ecosystem Trace Logs</span>
                    <div className="text-[10px] text-zinc-400 font-medium space-y-1">
                      <p className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-600">Trace Integrity:</span> <span className="text-emerald-400 font-bold">VERIFIED</span></p>
                      <p className="flex justify-between border-b border-white/5 pb-1"><span className="text-zinc-600">Timeline Impact:</span> <span>{chosenAction === 'proceed' ? `+32 Days Delay` : `0 Days Saved`}</span></p>
                      <p className="flex justify-between"><span className="text-zinc-600">Node Identifier:</span> <span className="font-mono">TRP-NODE-881X</span></p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentScreen('analysis')} 
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[11px] font-bold py-2.5 rounded-xl text-zinc-400 hover:text-white transition-all shadow-sm"
                >
                  ← Clear Simulation Trace
                </button>
              </div>
            )}

          </div>

          {/* RIGHT PANEL: DENSE INTEGRATED SYSTEM INSIGHTS & AI CHAT */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Upper Metric Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 flex flex-col justify-center min-h-[92px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">SYSTEM INSIGHT</span>
                </div>
                <p className="text-[11px] font-bold text-zinc-200 leading-snug">
                  "Redirecting this $100.00 to savings could grow to $102.50 in 6 months."
                </p>
              </div>

              <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 flex flex-col justify-center min-h-[92px]">
                <p className="text-xl font-black text-white tracking-tight flex items-baseline gap-1.5">
                  <span className="text-yellow-500">{streak}</span>
                  <span className="text-sm font-bold text-zinc-200">Active Streak</span>
                </p>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                  <span className="text-emerald-400 font-bold">{formatCurrency(protectedCapital)}</span> protected from impulse spending this week
                </p>
              </div>
            </div>

            {/* Projection Summary Layout */}
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4">
              <span className="block text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-3">Capital Projections</span>
              <div className="space-y-2.5 text-[11px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-zinc-400 font-medium">If you proceed today</span>
                  <span className="text-red-400 font-bold">-{formatCurrency(purchase.amount)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-zinc-400 font-medium">Redirected (6mo @ 5%)</span>
                  <span className="text-emerald-400 font-bold">+{formatCurrency(analysis.redirect_value_6mo)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-zinc-400 font-medium">Invested (10yr @ 10%)</span>
                  <span className="text-blue-400 font-bold">+$259.37</span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-zinc-300 font-bold">Net Goal Delay</span>
                  <span className="bg-red-500/10 text-red-400 text-[10px] font-black px-2 py-0.5 rounded">
                    {analysis.goal_impact_days} Days
                  </span>
                </div>
              </div>
            </div>

            {/* AI Assistant Console Component */}
            <div className="bg-zinc-950 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-h-[268px]">
              <div className="p-3 bg-zinc-900/40 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-zinc-200 uppercase tracking-wider">TerpSense Copilot</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[8px] font-bold">AI</span>
                </div>
                <span className="text-xs text-zinc-600">▲</span>
              </div>

              {/* Message Display Matrix */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[140px] custom-scrollbar text-[11px]">
                {messages.map((msg, i) => (
                  <div key={`msg-${i}`} className={`flex gap-3.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] flex-shrink-0 ${msg.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 border border-white/10 text-zinc-500'}`}>
                      {msg.role === 'user' ? 'U' : 'T'}
                    </div>
                    <div className={`p-2.5 rounded-xl max-w-[85%] font-medium leading-relaxed ${msg.role === 'user' ? 'bg-zinc-900 text-zinc-100 text-right' : 'bg-zinc-900/30 text-zinc-400'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Controller & Triggers */}
              <form onSubmit={handleFormSubmit} className="p-3 border-t border-white/5 bg-zinc-950/60 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {['Can I afford this?', 'What is the alternative?', 'Project 10yr yield', 'Risk assessment'].map((q) => (
                    <button 
                      type="button"
                      key={q} 
                      onClick={() => handleSendMessage(q)}
                      className="px-2.5 py-1 rounded-md bg-zinc-900 text-[10px] text-zinc-400 hover:text-white border border-white/5 transition-colors font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Query TerpSense copilot..."
                    className="w-full bg-zinc-900/40 border border-white/10 rounded-xl py-2 pl-3 pr-9 text-[11px] focus:outline-none focus:border-emerald-500/40 text-white placeholder:text-zinc-600"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-zinc-500 hover:text-white px-1">↑</button>
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}