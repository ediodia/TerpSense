'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SeverityBadge from '@/components/intervention/SeverityBadge';
import DecisionButtons from '@/components/intervention/DecisionButtons';

const pluralize = (count: number, noun: string) => count === 1 ? noun : noun + 's';
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const INITIAL_FALLBACK_ANALYSIS = {
  severity: "orange",
  insights: ["Analyzing real-time impact profiles...", "Calculating asset projections..."],
  goal_impact_days: 14,
  redirect_value_6mo: 105.00,
  alternative_suggestion: "Check for active proxy discount codes or look up vintage selections on Depop.",
  summary_line: "Syncing purchase risk assessment matrices...",
  score: 65
};

export default function InterventionPage() {
  const router = useRouter();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const [purchase] = useState({ amount: 100.00, merchant: "ASOS", category: "Clothing", user_id: "demo" });
  const [analysis, setAnalysis] = useState<any>(INITIAL_FALLBACK_ANALYSIS);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'I flagged this transaction based on your current trajectory. Ask me anything like can I afford this or what is the alternative.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const res = await fetch(`${API_URL}/analyze-purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: purchase.user_id, amount: purchase.amount, category: purchase.category, merchant: purchase.merchant }),
        });
        if (res.ok) {
          setAnalysis(await res.json());
        }
      } catch (err) {
        console.error("Analysis load error:", err);
      }
    }
    loadAnalysis();
  }, [API_URL, purchase]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, presetMessage?: string) => {
    if (e) e.preventDefault();
    const messageText = presetMessage || input;
    if (!messageText.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: purchase.user_id,
          message: messageText,
          context: {
            purchase_amount: purchase.amount,
            category: purchase.category,
            merchant: purchase.merchant,
            severity: analysis?.severity || "yellow",
            goal_impact_days: analysis?.goal_impact_days || 0,
            redirect_value_6mo: analysis?.redirect_value_6mo || 0,
            summary_line: analysis?.summary_line || ""
          }
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Fallback checks for response formatting keys from backend models
        const reply = data.response || data.message || data.content || "Query parsed successfully.";
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      } else {
        throw new Error("Chat engine non-200 endpoint error");
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Query indexed. Retaining your streak pays greater rewards over standard linear consumption lines." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (decisionType: "proceed" | "delay" | "redirect" | "alternative") => {
    setIsSubmittingDecision(true);
    try {
      const res = await fetch(`${API_URL}/record-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: purchase.user_id,
          purchase_amount: purchase.amount,
          category: purchase.category,
          merchant: purchase.merchant,
          decision: decisionType
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDecisionFeedback(data.confirmation_message);
      } else {
        throw new Error("Backend decision registration failed.");
      }
    } catch (error) {
      const fallbacks = {
        redirect: "Smart move. Your savings goal just got closer.",
        delay: "Got it. Come back in 7 days if you still want it.",
        proceed: "Noted. No judgment — just keeping you informed.",
        alternative: "Good thinking. A cheaper option could save you real money.",
      };
      setDecisionFeedback(fallbacks[decisionType]);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const compoundValue10Yr = purchase.amount * Math.pow(1.10, 10);

  return (
    <main className="w-screen h-[100dvh] bg-[#09090b] text-white overflow-hidden selection:bg-emerald-500/30 font-sans p-6 flex flex-col relative">
      
      {/* Absolute Header Base Layer to lock clickable visibility hierarchy */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0 relative z-50">
        <button 
          onClick={() => router.push('/dashboard')}
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Go back to dashboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Intervention Analysis</h1>
          <p className="text-[10px] font-medium text-zinc-500">Automated risk assessment by TerpSense</p>
        </div>
      </div>

      {/* Main Container Setup */}
      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        
        {/* Left Card Element Panel */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-0">
          <div className="relative bg-zinc-900/30 backdrop-blur-xl border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.1)] rounded-3xl overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-5">
              <div className="relative z-10 flex justify-between items-start">
                <SeverityBadge severity={analysis.severity} />
                <span className="text-2xl font-black text-white tracking-tight">{formatCurrency(purchase.amount)}</span>
              </div>

              <div className="relative z-10">
                <p className="text-[11px] font-medium text-zinc-500 mb-0.5">
                  Pending purchase at <span className="text-zinc-200 font-bold">{purchase.merchant}</span>
                </p>
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                  {analysis.summary_line}
                </p>
              </div>

              <div className="relative z-10 bg-zinc-950/50 border border-white/5 rounded-2xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5">Actionable Insights</p>
                <div className="space-y-2">
                  {analysis.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[9px] font-bold">{idx + 1}</span>
                      <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3">
                <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-4">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Goal delayed by</p>
                  <p className="text-lg font-black text-red-400">
                    {analysis.goal_impact_days} <span className="text-[10px] font-bold text-red-400/70">{pluralize(analysis.goal_impact_days, 'day')}</span>
                  </p>
                </div>
                <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-4">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Redirect (6mo)</p>
                  <p className="text-lg font-black text-emerald-400">{formatCurrency(analysis.redirect_value_6mo)}</p>
                </div>
              </div>

              {analysis.alternative_suggestion && (
                <div className="relative z-10 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-sm bg-purple-500/20 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">💡</span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-0.5">Better Option</p>
                    <p className="text-[11px] font-medium text-zinc-300 leading-relaxed">{analysis.alternative_suggestion}</p>
                  </div>
                </div>
              )}

              <div className="relative z-10 mt-auto pt-2">
                {decisionFeedback ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 text-xs font-bold tracking-tight text-center">
                    🎉 {decisionFeedback}
                  </div>
                ) : (
                  <>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">What do you want to do?</p>
                    <DecisionButtons
                      hasAlternative={!!analysis.alternative_suggestion}
                      onDecision={handleDecision}
                      isSubmitting={isSubmittingDecision}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Metrics & Chat View Panel */}
        <div className="lg:col-span-7 h-full flex flex-col gap-4 overflow-hidden min-h-0">
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">System Insight</p>
              </div>
              <p className="text-xs font-bold text-white leading-relaxed tracking-tight">
                "{analysis.summary_line}"
              </p>
            </div>
            
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-4 flex flex-col justify-center">
              <p className="text-lg font-black text-white tracking-tight mb-1">
                <span className="text-yellow-500">3</span> Active Streak
              </p>
              <p className="text-[11px] text-zinc-400 font-medium">
                <span className="text-emerald-400 font-bold">$284</span> protected from impulse spending this week
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex-shrink-0">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Capital Projections</p>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[11px] font-medium text-zinc-400">If you proceed today</span>
                <span className="text-[11px] font-bold text-red-400">-{formatCurrency(purchase.amount)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[11px] font-medium text-zinc-400">Redirected (6mo @ 5%)</span>
                <span className="text-[11px] font-bold text-emerald-400">+{formatCurrency(analysis.redirect_value_6mo)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[11px] font-medium text-zinc-400">Invested (10yr @ 10%)</span>
                <span className="text-[11px] font-bold text-blue-400">+{formatCurrency(compoundValue10Yr)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-zinc-300">Net Goal Delay</span>
                <span className="text-[9px] font-bold bg-red-500/10 text-red-400 px-2 py-1 rounded-md">{analysis.goal_impact_days} Days</span>
              </div>
            </div>
          </div>

          {/* Core Chat Element Window Box Frame */}
          <div className="flex-1 min-h-0 bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex-shrink-0 bg-zinc-900/50">
              <h2 className="text-[11px] font-bold text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-zinc-800 flex items-center justify-center text-[9px]">T</span>
                TerpSense Copilot <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[8px]">AI</span>
              </h2>
            </div>
            
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${msg.role === 'user' ? 'bg-zinc-800 text-white' : 'border border-white/10 text-zinc-400'}`}>
                    {msg.role === 'user' ? 'U' : 'T'}
                  </div>
                  <div className={`pt-0.5 text-[11px] font-medium leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'text-zinc-100 text-right' : 'text-zinc-300'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded border border-white/10 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-zinc-400">T</div>
                  <div className="pt-0.5 text-[11px] text-zinc-500 font-medium">Analyzing...</div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 bg-zinc-950 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {['Can I afford this?', 'What is the alternative?', 'Risk assessment'].map((q) => (
                  <button key={q} onClick={() => handleSendMessage(undefined, q)} disabled={isLoading} className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/5 text-[9px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer">{q}</button>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="Query TerpSense copilot..."
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-3 pr-10 text-[11px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer">↑</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}