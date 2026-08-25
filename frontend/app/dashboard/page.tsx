"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getFinancialProfile,
  getGoals,
  getPersonalTransactions,
  getProfiles,
  getSpendingSummary,
  getTransactions,
  logPersonalTransaction,
  resetDemo,
} from "@/lib/api";
import type { Goal, Profile, SpendingSummary, Transaction, TransactionCategory } from "@/types";
import { SpendingSummaryCard } from "@/components/dashboard/SpendingSummary";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { TerpSenseLogo } from "@/components/dashboard/TerpSenseLogo";
import { SpendingGauge } from "@/components/dashboard/SpendingGauge";
import { XPBadge } from "@/components/dashboard/XPBadge";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { ProtectedBadge } from "@/components/dashboard/ProtectedBadge";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { UserMenu } from "@/components/dashboard/UserMenu";
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

const PERSONAL_TOUR_STEPS: TourStep[] = [
  {
    target: "logo",
    title: "This is home base",
    description: "Click the TerpSense logo anytime, from anywhere in the app, to jump straight back to your dashboard.",
  },
  {
    target: "budget-gauge",
    title: "Your real safe-to-spend",
    description: "This number is computed from your actual pay and bills — not a guess. It always leaves you a safety buffer, even if your goals are ambitious.",
  },
  {
    target: "evaluate-btn",
    title: "Check before you buy",
    description: "Run any purchase through here before you buy it — the analysis uses your real numbers.",
  },
  {
    target: "log-txn",
    title: "Backfill a past purchase",
    description: "Already bought something without checking first? Log it here so it stays factored into your budget.",
  },
  {
    target: "activity",
    title: "Everything in one place",
    description: "Every transaction you log shows up here, categorized and dated.",
  },
  {
    target: "user-menu",
    title: "You're in control",
    description: "This is your account — log out anytime. TerpSense never moves real money; it only tracks and nudges.",
  },
];

const MOTIVATIONAL_MESSAGES = [
  "Your future self will thank you. 💪",
  "Every smart decision compounds.",
  "Top 20% of savers your age.",
  "Most people give in. You didn't.",
];

const LOG_CATEGORIES: TransactionCategory[] = [
  "Clothing",
  "Dining",
  "Entertainment",
  "Transport",
  "Subscriptions",
  "Health",
  "Shopping",
  "Other",
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: authSession, status: authStatus } = useSession();

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

  const [showLogForm, setShowLogForm] = useState(false);
  const [logAmount, setLogAmount] = useState("");
  const [logCategory, setLogCategory] = useState<TransactionCategory>("Dining");
  const [logMerchant, setLogMerchant] = useState("");
  const [logSubmitting, setLogSubmitting] = useState(false);

  const {
    setActiveGoal,
    resetSession,
    activeProfileId,
    setActiveProfileId,
    setSpendingSummary,
    dashboardNeedsRefresh,
    setDashboardNeedsRefresh,
    mode,
    setMode,
    personalBudget,
    setPersonalBudget,
  } = useSessionStore();

  const { streak, justIncremented } = useLoginStreak(activeProfileId);
  const [xp, setXp] = useState(0);
  const { shouldShow: showTour, dismiss: dismissTour } = useOnboarding(mode);

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

  async function loadPersonalData(opts: { silent?: boolean } = {}) {
    const token = authSession?.backendToken;
    if (!token) return;
    try {
      if (!opts.silent) setLoading(true);
      const profile = await getFinancialProfile(token);
      const txns = await getPersonalTransactions(token);
      setActiveProfileId(authSession.user.id);
      setSummary(profile.spending_summary);
      setSpendingSummary(profile.spending_summary);
      setPersonalBudget(profile.budget);
      setGoals(profile.goal ? [profile.goal] : []);
      if (profile.goal) setActiveGoal(profile.goal);
      setTransactions(txns);
      setXp(getXP(authSession.user.id));
      setError("");
    } catch (err) {
      if (err instanceof Error && err.message.includes("400")) {
        router.push("/onboarding-personal");
        return;
      }
      setError("Could not load your financial profile. Is the backend running?");
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

  async function handleLogTransaction(e: React.FormEvent) {
    e.preventDefault();
    const token = authSession?.backendToken;
    const amount = parseFloat(logAmount);
    if (!token || !amount || amount <= 0) return;

    setLogSubmitting(true);
    try {
      await logPersonalTransaction(token, {
        amount,
        category: logCategory,
        merchant: logMerchant.trim() || undefined,
        date: new Date().toISOString().slice(0, 10),
        type: "purchase",
      });
      setLogAmount("");
      setLogMerchant("");
      setShowLogForm(false);
      await loadPersonalData({ silent: true });
    } finally {
      setLogSubmitting(false);
    }
  }

  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "authenticated") {
      setMode("personal");
      loadPersonalData();
      return;
    }

    setMode("mock");
    if (dashboardNeedsRefresh) setDashboardNeedsRefresh(false);
    loadData(activeProfileId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const isPersonal = mode === "personal";

  if (loading || authStatus === "loading") {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center px-6">
        <div className="bg-zinc-900/60 border border-red-500/20 backdrop-blur-xl rounded-3xl p-8 max-w-sm text-center shadow-2xl">
          <p className="text-red-400 text-sm font-medium mb-4">⚠️ {error}</p>
          <button
            onClick={() => (isPersonal ? loadPersonalData() : loadData(activeProfileId))}
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

  const gaugeBudget = isPersonal ? personalBudget?.safe_to_spend_weekly ?? 0 : BIWEEKLY_BUDGET;
  const gaugeLabel = isPersonal ? "This Week's Safe-to-Spend" : "Biweekly Budget";
  const totalProtected = Math.max(0, gaugeBudget - totalSpent);
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
            {isPersonal ? (
              authSession?.user?.name && (
                <div data-tour="user-menu">
                  <UserMenu name={authSession.user.name} />
                </div>
              )
            ) : (
              activeProfile && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-950 rounded-full flex items-center justify-center text-xl shadow-inner border border-white/5">
                    {activeProfile.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight">{activeProfile.name}</p>
                    <p className="text-xs font-medium text-zinc-500">{activeProfile.description}</p>
                  </div>
                </div>
              )
            )}
          </div>
          {!isPersonal && (
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
          )}
        </header>

        {isPersonal && personalBudget && (personalBudget.warning || personalBudget.distress) && (
          <div
            className={`rounded-3xl px-5 py-4 border backdrop-blur-xl flex items-start gap-3 shadow-2xl ${
              personalBudget.distress
                ? "bg-red-500/10 border-red-500/20"
                : "bg-orange-500/10 border-orange-500/20"
            }`}
          >
            <span className="text-lg flex-shrink-0">{personalBudget.distress ? "🚨" : "⚠️"}</span>
            <p className={`text-xs font-medium leading-relaxed ${personalBudget.distress ? "text-red-300" : "text-orange-300"}`}>
              {personalBudget.warning}
            </p>
          </div>
        )}

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
              <div data-tour="budget-gauge">
                <SpendingGauge spent={totalSpent} budget={gaugeBudget} label={gaugeLabel} />
              </div>
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
                {activeGoal ? (
                  <GoalCard goal={activeGoal} />
                ) : (
                  isPersonal && (
                    <div className="p-6 h-full flex flex-col items-center justify-center text-center gap-2">
                      <span className="text-xl">🎯</span>
                      <p className="text-xs text-zinc-500 font-medium">No savings goal set yet.</p>
                      <Link href="/onboarding-personal" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
                        Add one →
                      </Link>
                    </div>
                  )
                )}
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
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-emerald-500 text-zinc-950 font-black py-5 rounded-3xl text-lg cta-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)]"
            >
              <span className="relative z-10 font-bold tracking-tight">Evaluate a Purchase</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>

            {isPersonal && (
              <div data-tour="log-txn" className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                {!showLogForm ? (
                  <button
                    onClick={() => setShowLogForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    + Log a past purchase
                  </button>
                ) : (
                  <form onSubmit={handleLogTransaction} className="p-4 flex flex-col gap-2.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          placeholder="Amount"
                          value={logAmount}
                          onChange={(e) => setLogAmount(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-6 pr-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <select
                        value={logCategory}
                        onChange={(e) => setLogCategory(e.target.value as TransactionCategory)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        {LOG_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Merchant (optional)"
                      value={logMerchant}
                      onChange={(e) => setLogMerchant(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLogForm(false)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={logSubmitting}
                        className="flex-1 py-2 rounded-lg text-xs font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                      >
                        {logSubmitting ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div data-tour="activity" className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col min-h-[400px] shadow-2xl">
              <div className="px-6 py-5 border-b border-white/5 bg-zinc-900/20">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent Activity</p>
              </div>
              <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                {transactions.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 gap-1.5">
                    <span className="text-xl">🧾</span>
                    <p className="text-xs text-zinc-500 font-medium">No transactions yet.</p>
                  </div>
                )}
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
        <OnboardingTour steps={isPersonal ? PERSONAL_TOUR_STEPS : TOUR_STEPS} onDone={dismissTour} />
      )}
    </main>
  );
}
