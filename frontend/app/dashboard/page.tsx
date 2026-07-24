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
import { TerpSenseLogo } from "@/components/dashboard/TerpSenseLogo";
import { SpendingGauge } from "@/components/dashboard/SpendingGauge";
import { XPBadge } from "@/components/dashboard/XPBadge";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { ProtectedBadge } from "@/components/dashboard/ProtectedBadge";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { OnboardingTour, type TourStep } from "@/components/dashboard/OnboardingTour";
import { useSessionStore } from "@/store/sessionStore";
import { useLoginStreak } from "@/lib/streak";
import { getXP } from "@/lib/xp";
import { useOnboarding } from "@/lib/onboarding";
import { CATEGORY_ICONS, BIWEEKLY_BUDGET } from "@/lib/constants";

const TOUR_STEPS: TourStep[] = [
  {
    target: "logo",
    title: "This is home base",
    description: "Click the TerpSense logo anytime, from anywhere in the app, to jump straight back to your dashboard.",
  },
  {
    target: "streak",
    title: "Keep your streak alive",
    description: "Come back daily and stay on top of your spending to build a streak — it's tracked automatically.",
  },
  {
    target: "evaluate-btn",
    title: "Check before you buy",
    description: "Before making a purchase, run it through here. You'll get an instant read on whether it's a smart move, grounded in your real spending.",
  },
  {
    target: "activity",
    title: "Everything in one place",
    description: "Every transaction shows up here automatically, categorized and dated, so you always know where your money's going.",
  },
  {
    target: "switch-profile",
    title: "Try other spending styles",
    description: "Switch between demo profiles to see how the same purchase can look totally different depending on someone's habits.",
  },
];

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
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [message] = useState(
    () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  const {
    setActiveGoal,
    resetSession,
    activeProfileId,
    setActiveProfileId,
    setSpendingSummary,
    dashboardNeedsRefresh,
    setDashboardNeedsRefresh,
  } = useSessionStore();

  const { streak, justIncremented } = useLoginStreak(activeProfileId);
  const [xp, setXp] = useState(0);
  const { shouldShow: showTour, dismiss: dismissTour } = useOnboarding();

  async function loadData(profileId = activeProfileId, opts: { silent?: boolean } = {}) {
    try {
      if (!opts.silent) setLoading(true);
      const [s, g, t, p] = await Promise.all([
        getSpendingSummary("demo", profileId),
        getGoals("demo", profileId),
        getTransactions("demo", profileId),
        getProfiles(),
      ]);
      setSummary(s);
      setSpendingSummary(s);
      setGoals(g);
      setTransactions(t);
      setProfiles(p);
      setXp(getXP(profileId));
      if (g.length > 0) setActiveGoal(g[0]);
    } catch {
      setError("Could not connect to TerpSense backend. Is the server running?");
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      resetSession();
      await resetDemo();
      await loadData(activeProfileId, { silent: true });
    } finally {
      setResetting(false);
    }
  }

  async function handleSwitchProfile() {
    if (profiles.length < 2) return;
    setSwitching(true);
    try {
      const others = profiles.filter((p) => p.id !== activeProfileId);
      const next = others[Math.floor(Math.random() * others.length)];
      setActiveProfileId(next.id);
      await loadData(next.id, { silent: true });
    } finally {
      setSwitching(false);
    }
  }

  useEffect(() => {
    if (dashboardNeedsRefresh) setDashboardNeedsRefresh(false);
    loadData(activeProfileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  if (loading) {
    return <DashboardSkeleton />;
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
  const totalSpent = summary ? Object.values(summary.week).reduce((a, b) => a + b, 0) : 0;
  const biweeklyBudget = BIWEEKLY_BUDGET;
  const totalProtected = Math.max(0, biweeklyBudget - totalSpent);
  const futureValue = Math.round(totalProtected * Math.pow(1.1, 10));

  return (
    <main className="min-h-screen bg-transparent text-zinc-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 relative z-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-white/5 rounded-3xl p-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div data-tour="logo">
              <TerpSenseLogo />
            </div>
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
              data-tour="switch-profile"
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
              disabled={resetting}
              className="flex items-center justify-center gap-2 px-4 h-10 bg-zinc-800/60 hover:bg-zinc-700/80 disabled:opacity-50 text-xs font-bold text-zinc-300 rounded-xl transition-all border border-white/5"
            >
              {resetting && <span className="w-3 h-3 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />}
              Reset
            </button>
          </div>
        </header>

        {(switching || resetting) && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900/90 border border-emerald-500/20 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl animate-fade-in">
            <span className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            <span className="text-xs font-bold text-zinc-300">
              {switching ? "Switching profile..." : "Resetting demo..."}
            </span>
          </div>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-4 transition-opacity duration-300 ${
            switching || resetting ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SpendingGauge spent={totalSpent} budget={biweeklyBudget} />
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div data-tour="streak">
                    <StreakBadge streak={streak} justIncremented={justIncremented} />
                  </div>
                  <ProtectedBadge amount={totalProtected} />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {activeGoal && <GoalCard goal={activeGoal} />}
              </div>
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {summary && <SpendingSummaryCard summary={summary} />}
              </div>
            </div>

            <XPBadge xp={xp} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link
              href="/purchase"
              data-tour="evaluate-btn"
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 font-black py-5 rounded-3xl text-lg shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)]"
            >
              <span className="relative z-10 font-bold tracking-tight">Evaluate a Purchase</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>

            <div data-tour="activity" className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-[400px] shadow-2xl">
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

      {showTour && !switching && !resetting && (
        <OnboardingTour steps={TOUR_STEPS} onDone={dismissTour} />
      )}
    </main>
  );
}