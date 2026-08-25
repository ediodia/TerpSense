"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TerpSenseLogo } from "@/components/dashboard/TerpSenseLogo";
import { CATEGORY_ICONS } from "@/lib/constants";
import { saveFinancialProfile } from "@/lib/api";
import type { PayFrequency, RecurringExpense, RiskTolerance } from "@/types";

const EXPENSE_CATEGORIES = ["Rent", "Utilities", "Transport", "Subscriptions", "Health", "Other"];
const FREQUENCIES: { id: PayFrequency; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Biweekly" },
  { id: "monthly", label: "Monthly" },
];
const RISK_LEVELS: { id: RiskTolerance; label: string; desc: string }[] = [
  { id: "conservative", label: "Conservative", desc: "Save 10% — prioritize flexibility" },
  { id: "balanced", label: "Balanced", desc: "Save 20% — the default recommendation" },
  { id: "aggressive", label: "Aggressive", desc: "Save 30% — maximize progress toward goals" },
];

const TOTAL_STEPS = 3;

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function OnboardingPersonalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [payAmount, setPayAmount] = useState("");
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("biweekly");
  const [nextPayDate, setNextPayDate] = useState(todayPlus(7));

  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [expenseDraft, setExpenseDraft] = useState({ name: "", amount: "", category: "Rent", frequency: "monthly" as PayFrequency });

  const [goalName, setGoalName] = useState("Emergency Fund");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("balanced");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function addExpense() {
    const amount = parseFloat(expenseDraft.amount);
    if (!expenseDraft.name.trim() || !amount || amount <= 0) return;
    setExpenses((prev) => [...prev, { ...expenseDraft, name: expenseDraft.name.trim(), amount }]);
    setExpenseDraft({ name: "", amount: "", category: "Rent", frequency: "monthly" });
  }

  function removeExpense(i: number) {
    setExpenses((prev) => prev.filter((_, idx) => idx !== i));
  }

  function validateStep(): string {
    if (step === 0) {
      const amount = parseFloat(payAmount);
      if (!amount || amount <= 0) return "Enter how much you're paid each period.";
      if (!nextPayDate) return "Pick your next pay date.";
    }
    if (step === 2 && goalTarget) {
      const amount = parseFloat(goalTarget);
      if (amount <= 0) return "Goal amount must be greater than $0.";
    }
    return "";
  }

  function next() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!session?.backendToken) {
      setError("Your session expired — please sign in again.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await saveFinancialProfile(session.backendToken, {
        pay_amount: parseFloat(payAmount),
        pay_frequency: payFrequency,
        next_pay_date: nextPayDate,
        risk_tolerance: riskTolerance,
        expenses,
        goal: goalTarget
          ? { name: goalName || "Savings Goal", target_amount: parseFloat(goalTarget), target_date: goalDate || null }
          : null,
      });
      router.push("/dashboard");
    } catch {
      setError("Couldn't save your profile — check that the backend is running and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <TerpSenseLogo />
          <p className="text-sm text-zinc-400 text-center max-w-sm">
            A few real numbers, and TerpSense will compute a safe weekly budget for you — grounded
            in your actual pay and bills, not a guess.
          </p>
        </div>

        <div className="flex items-center gap-1.5 justify-center">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-emerald-400" : i < step ? "w-4 bg-emerald-500/40" : "w-4 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        <Card>
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-bold text-white mb-1">What's your pay?</p>
                <p className="text-xs text-zinc-500 mb-4">This is the foundation of your budget — we never share it anywhere.</p>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Pay amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3.5 text-zinc-100 text-lg font-medium placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  How often?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPayFrequency(f.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        payFrequency === f.id
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : "bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Next pay date
                </label>
                <input
                  type="date"
                  value={nextPayDate}
                  onChange={(e) => setNextPayDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-bold text-white mb-1">Recurring bills</p>
                <p className="text-xs text-zinc-500">Rent, subscriptions, phone — anything that comes out automatically. Optional.</p>
              </div>

              {expenses.length > 0 && (
                <div className="flex flex-col gap-2">
                  {expenses.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{CATEGORY_ICONS[e.category] ?? "💳"}</span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{e.name}</p>
                          <p className="text-[11px] text-zinc-500">${e.amount.toFixed(2)} / {e.frequency}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExpense(i)}
                        className="text-zinc-500 hover:text-red-400 text-xs font-bold cursor-pointer px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. Rent)"
                  value={expenseDraft.name}
                  onChange={(e) => setExpenseDraft((d) => ({ ...d, name: e.target.value }))}
                  className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Amount"
                  value={expenseDraft.amount}
                  onChange={(e) => setExpenseDraft((d) => ({ ...d, amount: e.target.value }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={expenseDraft.frequency}
                  onChange={(e) => setExpenseDraft((d) => ({ ...d, frequency: e.target.value as PayFrequency }))}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <select
                  value={expenseDraft.category}
                  onChange={(e) => setExpenseDraft((d) => ({ ...d, category: e.target.value }))}
                  className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addExpense}>
                + Add bill
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-bold text-white mb-1">Your savings goal</p>
                <p className="text-xs text-zinc-500 mb-4">Optional — TerpSense will pace contributions toward it safely.</p>
                <div className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    placeholder="Goal name (e.g. Emergency Fund)"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Target amount"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Target date (optional)
                    </label>
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Risk tolerance
                </label>
                <div className="flex flex-col gap-2">
                  {RISK_LEVELS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRiskTolerance(r.id)}
                      className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                        riskTolerance === r.id
                          ? "bg-emerald-500/15 border-emerald-500/40"
                          : "bg-zinc-800/60 border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <p className={`text-sm font-bold ${riskTolerance === r.id ? "text-emerald-400" : "text-zinc-200"}`}>
                        {r.label}
                      </p>
                      <p className="text-xs text-zinc-500">{r.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-600 mt-3">
                  Applies only when your goal has no target date. TerpSense always keeps a safe
                  spending buffer, no matter which level you pick.
                </p>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-xs font-medium mt-4">{error}</p>}

          <div className="flex items-center justify-between mt-6">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={back} disabled={submitting}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {step < TOTAL_STEPS - 1 ? (
              <Button type="button" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} loading={submitting}>
                Set up my budget
              </Button>
            )}
          </div>
        </Card>

        <p className="text-center text-[11px] text-zinc-600 max-w-sm mx-auto">
          Not financial advice. TerpSense tracks your progress and nudges your decisions — it never
          moves real money.
        </p>
      </div>
    </main>
  );
}
