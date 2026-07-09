"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getGoals,
  getProfiles,
  getSpendingSummary,
  getTransactions,
  resetDemo,
} from "@/lib/api";
import type { Goal, Profile, SpendingSummary, Transaction } from "@/types";
import { SpendingSummaryCard } from "@/components/dashboard/SpendingSummary";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { useSessionStore } from "@/store/sessionStore";

// Reusable animated count engine for premium visual entry transitions
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(Math.floor(current));
    }, 1000 / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

// Clean, modular high-fidelity TerpSense logomark
export function TerpSenseLogo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="relative z-10">
          <rect width="32" height="32" rx="10" fill="#09090b" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" />
          <ellipse cx="16" cy="16" rx="8" ry="6" fill="#10b981" />
          <ellipse cx="16" cy="16" rx="5" ry="4" fill="#059669" />
          <line x1="16" y1="12" x2="16" y2="20" stroke="#047857" strokeWidth="1" />
          <line x1="11" y1="16" x2="21" y2="16" stroke="#047857" strokeWidth="1" />
          <line x1="12" y1="13" x2="20" y2="19" stroke="#047857" strokeWidth="1" />
          <line x1="20" y1="13" x2="12" y2="19" stroke="#047857" strokeWidth="1" />
          <ellipse cx="24" cy="14" rx="2.5" ry="2" fill="#10b981" />
          <ellipse cx="8.5" cy="17" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="13" cy="22" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="19" cy="22" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="13" cy="10" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="19" cy="10" rx="1.5" ry="1" fill="#10b981" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
        Terp<span className="text-emerald-500 font-black">Sense</span>
      </span>
    </div>
  );
}

function SpendingGauge({ spent, budget }: { spent: number; budget: number }) {
  const [animated, setAnimated] = useState(0);
  const percent = Math.min(100, Math.round((spent / budget) * 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animated / 100) * circumference;
  const color = percent > 80 ? "#ef4444" : percent > 60 ? "#f97316" : "#10b981";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(percent), 300);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-center gap-4 h-full relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#27272a" strokeWidth="12" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.3s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white">{percent}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Biweekly Budget</p>
          <p className="text-2xl font-black text-white tracking-tight">
            ${spent.toFixed(2)}
          </p>
          <p className="text-sm font-medium text-zinc-400">of ${budget}</p>
          <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/5">
            {percent > 80 ? (
              <span className="text-xs text-red-400 font-bold">🚨 Almost out</span>
            ) : percent > 60 ? (
              <span className="text-xs text-orange-400 font-bold">⚠️ Slow down</span>
            ) : (
              <span className="text-xs text-emerald-400 font-bold">Core budget on track</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function XPBadge({ xp = 75 }: { xp?: number }) {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  const [filled, setFilled] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFilled(progress), 400);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 relative overflow-hidden shadow-2xl">
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full pointer-events-none" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Financial IQ</span>
        <span className="text-sm font-black text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md">Lvl {level}</span>
      </div>
      <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-white/5 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${filled}%` }}
        />
      </div>
      <p className="text-xs font-medium text-zinc-500 mt-2 relative z-10">{progress}/100 XP to Level {level + 1}</p>
    </div>
  );
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
};

const MOTIVATIONAL_MESSAGES = [
  "Your future self will thank you. 💪",
  "Every smart decision compounds.",
  "Top 20% of savers your age.",
  "Most people give in. You didn't.",
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");
  const [message] = useState(
    () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  const {
    setActiveGoal,
    resetSession,
    activeProfileId,
    setActiveProfileId,
    dashboardNeedsRefresh,
    setDashboardNeedsRefresh,
  } = useSessionStore();

  async function loadData(profileId = activeProfileId) {
    try {
      setLoading(true);
      const [s, g, t, p] = await Promise.all([
        getSpendingSummary("demo", profileId),
        getGoals(),
        getTransactions("demo", profileId),
        getProfiles(),
      ]);
      setSummary(s);
      setGoals(g);
      setTransactions(t);
      setProfiles(p);
      if (g.length > 0) setActiveGoal(g[0]);
    } catch {
      setError("Could not connect to TerpSense backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    resetSession();
    await resetDemo();
    await loadData(activeProfileId);
  }

  async function handleSwitchProfile() {
    if (profiles.length < 2) return;
    setSwitching(true);
    try {
      const others = profiles.filter((p) => p.id !== activeProfileId);
      const next = others[Math.floor(Math.random() * others.length)];
      setActiveProfileId(next.id);
      await loadData(next.id);
    } finally {
      setSwitching(false);
    }
  }

  useEffect(() => {
    if (dashboardNeedsRefresh) setDashboardNeedsRefresh(false);
    loadData(activeProfileId);
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium">Syncing data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center px-6">
        <div className="bg-zinc-900/60 border border-red-500/20 backdrop-blur-xl rounded-3xl p-8 max-w-sm text-center shadow-2xl">
          <p className="text-red-400 text-sm font-medium mb-4">⚠️ {error}</p>
          <button
            onClick={() => loadData(activeProfileId)}
            className="text-xs font-bold bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </main>
    );
  }

  const activeGoal = goals[0] ?? null;
  const biggestRisk = summary
    ? Object.entries(summary.week)
        .filter(([cat]) => {
          const avg = summary.category_weekly_averages[cat] ?? 0;
          return summary.week[cat] > avg && avg > 0;
        })
        .sort(([, a], [, b]) => b - a)[0]
    : null;
  const biggestRiskCategory = biggestRisk?.[0];
  const biggestRiskAvg = biggestRiskCategory ? summary?.category_weekly_averages[biggestRiskCategory] ?? 0 : 0;
  const overByPercent = biggestRiskAvg > 0 ? Math.round((((biggestRisk?.[1] ?? 0) - biggestRiskAvg) / biggestRiskAvg) * 100) : 0;
  const totalProtected = 284;
  const futureValue = Math.round(totalProtected * Math.pow(1.1, 10));
  const totalSpent = summary ? Object.values(summary.week).reduce((a, b) => a + b, 0) : 209;
  const biweeklyBudget = 800;

  return (
    <main className="min-h-screen bg-transparent text-zinc-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 relative z-10">
        
        {/* Top Navigation & Profile Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-white/5 rounded-3xl p-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <TerpSenseLogo />
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            {activeProfile && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-950 rounded-full flex items-center justify-center text-xl shadow-inner border border-white/5">
                  {activeProfile.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-white tracking-tight">{activeProfile.name}</p>
                  <p className="text-xs font-medium text-zinc-500">{activeProfile.description}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchProfile}
              disabled={switching || profiles.length < 2}
              className="flex items-center justify-center w-10 h-10 bg-zinc-800/60 hover:bg-zinc-700/80 disabled:opacity-50 rounded-xl transition-all border border-white/5"
            >
              {switching ? (
                <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-zinc-300">⇄</span>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center px-4 h-10 bg-zinc-800/60 hover:bg-zinc-700/80 text-xs font-bold text-zinc-300 rounded-xl transition-all border border-white/5"
            >
              Reset
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SpendingGauge spent={totalSpent} budget={biweeklyBudget} />
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
                    <p className="text-3xl font-black text-emerald-400 tracking-tighter">🔥 3</p>
                    <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">Streak</p>
                  </div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl backdrop-blur-xl">
                    <p className="text-2xl font-black text-white tracking-tighter">
                      $<AnimatedNumber value={totalProtected} />
                    </p>
                    <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">Saved</p>
                  </div>
                  <div className="col-span-2 bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex items-center justify-between relative overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">10 Year Projection</p>
                      <p className="text-xl font-black text-blue-400 tracking-tighter">
                        $<AnimatedNumber value={futureValue} />
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-lg border border-blue-500/20">
                      📈
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Banner */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
              <p className="text-sm font-medium text-zinc-300 italic">"{message}"</p>
              {biggestRiskCategory ? (
                <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5 whitespace-nowrap">
                  <span className="text-xs font-black text-orange-400">⚠️ {biggestRiskCategory}</span>
                  <span className="text-xs font-bold text-orange-500/70 bg-orange-500/10 px-1.5 py-0.5 rounded-md">{overByPercent}% over avg</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 whitespace-nowrap">
                  <span className="text-xs font-black text-emerald-400">✅ Spending on track</span>
                </div>
              )}
            </div>

            {/* Goals and Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {activeGoal && <GoalCard goal={activeGoal} />}
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {summary && <SpendingSummaryCard summary={summary} />}
              </div>
            </div>
            
            <XPBadge xp={75} />
          </div>

          {/* Right Column (Transactions & Action Routing Target) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <Link
              href="/purchase"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 font-black py-5 rounded-3xl text-lg shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)]"
            >
              <span className="relative z-10 font-bold tracking-tight">Evaluate a Purchase</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>

            <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-[400px] shadow-2xl">
              <div className="px-6 py-5 border-b border-white/5 bg-zinc-900/20">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent Activity</p>
              </div>
              <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 mx-2 my-1 rounded-2xl hover:bg-zinc-800/40 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center text-lg shadow-inner">
                        {CATEGORY_ICONS[tx.category] ?? "💳"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-100 tracking-tight">{tx.merchant}</p>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-black ${tx.category === "Clothing" ? "text-orange-400" : "text-zinc-100"}`}>
                      -${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}