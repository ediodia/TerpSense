'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/sessionStore';
import { recordDecision } from '@/lib/api';
import { formatCurrency, pluralize, SEVERITY_TOKENS } from '@/lib/utils';
import type { Decision } from '@/types';

export default function InterventionPage() {
  const router = useRouter();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    pendingPurchase,
    interventionResult,
    activeGoal,
    activeProfileId,
    setDecision,
    setUpdatedGoalAmount,
    setDashboardNeedsRefresh,
  } = useSessionStore();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I flagged this transaction based on your current trajectory. Ask me anything like can I afford this or what is the alternative.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!pendingPurchase || !interventionResult) {
      router.replace('/purchase');
    }
  }, [pendingPurchase, interventionResult, router]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  if (!pendingPurchase || !interventionResult) return null;

  const analysis = interventionResult;

  async function sendMessage(presetMessage?: string) {
    const messageText = presetMessage ?? input;
    if (!messageText.trim() || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeProfileId ?? 'demo',
          message: messageText,
          context: {
            purchase_amount: pendingPurchase!.amount,
            category: pendingPurchase!.category,
            merchant: pendingPurchase!.merchant,
            severity: analysis.severity,
            goal_impact_days: analysis.goal_impact_days,
            redirect_value_6mo: analysis.redirect_value_6mo,
            summary_line: analysis.summary_line,
          },
        }),
      });

      if (!res.ok) throw new Error(`Chat endpoint returned ${res.status}`);

      const data = await res.json();
      const reply =
        (typeof data?.response === 'string' && data.response) ||
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.content === 'string' && data.content) ||
        (Array.isArray(data?.content) && data.content.find((c: any) => c.type === 'text')?.text) ||
        'Hmm, that came back empty — try rephrasing?';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Lost connection to the copilot for a sec — check the backend's running and try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function handleDecision(decisionType: Decision) {
    setIsSubmittingDecision(true);
    try {
      const data = await recordDecision({
        user_id: pendingPurchase!.user_id ?? 'demo',
        purchase_amount: pendingPurchase!.amount,
        category: pendingPurchase!.category,
        merchant: pendingPurchase!.merchant,
        decision: decisionType,
        profile_id: activeProfileId,
      });

      if (data.updated_goal_amount != null) {
        setUpdatedGoalAmount(data.updated_goal_amount);
      }
      setDecision(decisionType);
      setDashboardNeedsRefresh(true);
      router.push('/outcome');
    } catch (error) {
      console.error('Decision recording failed:', error);
      setDecision(decisionType);
      setDashboardNeedsRefresh(true);
      router.push('/outcome');
    } finally {
      setIsSubmittingDecision(false);
    }
  }

  const sev = SEVERITY_TOKENS[analysis.severity] || SEVERITY_TOKENS.yellow;
  const compoundValue10Yr = pendingPurchase.amount * Math.pow(1.1, 10);

  return (
    <main className="w-screen h-[100dvh] bg-[#09090b] text-white overflow-hidden selection:bg-emerald-500/30 font-sans p-6 flex flex-col relative">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0 relative z-50">
        <button
          onClick={() => router.push('/dashboard')}
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Go back to dashboard"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Intervention Analysis</h1>
          <p className="text-[10px] font-medium text-zinc-500">Automated risk assessment by TerpSense</p>
        </div>
      </div>

      <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        <div className="lg:col-span-5 h-full flex flex-col min-h-0">
          <div className={`relative bg-zinc-900/30 backdrop-blur-xl border ${sev.border} ${sev.glow} rounded-3xl overflow-hidden flex flex-col flex-1 min-h-0`}>
            <div className={`absolute inset-0 bg-gradient-to-b ${sev.gradient} via-transparent to-transparent pointer-events-none`} />

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-5">
              <div className="relative z-10 flex justify-between items-start">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md bg-zinc-900/60 ${sev.border}`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${sev.dot}`} />
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${sev.text}`}>{sev.label}</span>
                </div>
                <span className="text-3xl font-black text-white tracking-tight">{formatCurrency(pendingPurchase.amount)}</span>
              </div>

              <div className="relative z-10">
                <p className="text-[11px] font-medium text-zinc-500 mb-0.5">
                  Pending purchase at <span className="text-zinc-200 font-bold">{pendingPurchase.merchant || pendingPurchase.category}</span>
                </p>
                <p className="text-sm font-medium text-zinc-300 leading-relaxed">{analysis.summary_line}</p>
              </div>

              <div className="relative z-10 bg-zinc-950/50 border border-white/5 rounded-2xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5">Actionable Insights</p>
                <div className="space-y-2">
                  {analysis.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[9px] font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3">
                <div className="bg-zinc-950/50 border border-red-500/10 rounded-2xl p-4">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Goal delayed by</p>
                  <p className="text-2xl font-black text-red-400 leading-none">
                    {analysis.goal_impact_days}
                    <span className="text-[10px] font-bold text-red-400/70 ml-1">{pluralize(analysis.goal_impact_days, 'day')}</span>
                  </p>
                </div>
                <div className="bg-zinc-950/50 border border-emerald-500/10 rounded-2xl p-4">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Redirect (6mo)</p>
                  <p className="text-2xl font-black text-emerald-400 leading-none">{formatCurrency(analysis.redirect_value_6mo)}</p>
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
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">What do you want to do?</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleDecision('redirect')}
                    disabled={isSubmittingDecision}
                    className="bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all rounded-xl p-3 text-left group flex flex-col gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform text-sm">🎯</div>
                    <span className="block text-xs font-bold text-white tracking-tight">Redirect to Savings</span>
                    <span className="block text-[9px] text-zinc-500">Put this money toward your goal</span>
                  </button>

                  <button
                    onClick={() => handleDecision('delay')}
                    disabled={isSubmittingDecision}
                    className="bg-zinc-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all rounded-xl p-3 text-left group flex flex-col gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform text-sm">⏳</div>
                    <span className="block text-xs font-bold text-white tracking-tight">Wait 7 Days</span>
                    <span className="block text-[9px] text-zinc-500">Come back if you still want it</span>
                  </button>

                  <button
                    onClick={() => analysis.alternative_suggestion && handleDecision('alternative')}
                    disabled={!analysis.alternative_suggestion || isSubmittingDecision}
                    className={`bg-zinc-900/40 border border-white/5 transition-all rounded-xl p-3 text-left flex flex-col gap-1.5 ${analysis.alternative_suggestion && !isSubmittingDecision ? 'hover:border-purple-500/30 hover:bg-purple-500/10 group' : 'opacity-40 cursor-not-allowed'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform text-sm">🔍</div>
                    <span className="block text-xs font-bold text-white tracking-tight">See Alternative</span>
                    <span className="block text-[9px] text-zinc-500">Find a better deal</span>
                  </button>

                  <button
                    onClick={() => handleDecision('proceed')}
                    disabled={isSubmittingDecision}
                    className="relative bg-[#050806] border-2 border-emerald-500/70 hover:border-emerald-400 transition-all rounded-xl p-3 text-left flex flex-col gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_18px_rgba(16,185,129,0.15)] hover:shadow-[0_0_26px_rgba(16,185,129,0.3)] group"
                  >
                    <span className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[8px] font-black text-emerald-400 tracking-[0.2em]">非常口</span>
                      <span className="text-[8px] font-black text-emerald-400 tracking-widest">EXIT</span>
                    </div>
                    <div className="relative z-10 flex items-center gap-2">
                      <span className="text-base group-hover:translate-x-0.5 transition-transform">🏃‍♂️</span>
                      <span className="block text-xs font-black text-emerald-400 tracking-tight uppercase">Proceed Anyway</span>
                    </div>
                    <span className="relative z-10 block text-[9px] text-emerald-500/60">I have considered this</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 h-full flex flex-col gap-4 overflow-hidden min-h-0">
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">System Insight</p>
              </div>
              <p className="text-xs font-bold text-white leading-relaxed tracking-tight">"{analysis.summary_line}"</p>
            </div>

            <div className="bg-zinc-900/30 border border-yellow-500/10 rounded-3xl p-4 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 blur-2xl rounded-full pointer-events-none" />
              <p className="text-lg font-black text-white tracking-tight mb-1 relative z-10">
                <span className="text-yellow-500">3</span> Active Streak
              </p>
              <p className="text-[11px] text-zinc-400 font-medium relative z-10">
                <span className="text-emerald-400 font-bold">{formatCurrency(284)}</span> protected from impulse spending this week
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 flex-shrink-0">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Capital Projections</p>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <span className="text-[11px] font-medium text-zinc-400">If you proceed today</span>
                <span className="text-[11px] font-bold text-red-400">-{formatCurrency(pendingPurchase.amount)}</span>
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
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/5 text-[9px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
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
                  onKeyDown={handleInputKeyDown}
                  disabled={isLoading}
                  placeholder="Query TerpSense copilot..."
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-3 pr-10 text-[11px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}