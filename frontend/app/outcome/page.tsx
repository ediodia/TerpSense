"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OutcomeCard } from "@/components/outcome/OutcomeCard";
import { useSessionStore } from "@/store/sessionStore";
import { addXP } from "@/lib/xp";

const CONFIRMATION_MESSAGES: Record<string, string> = {
  redirect: "Smart move. Your savings goal just got closer.",
  delay: "Got it. Come back in 7 days if you still want it.",
  proceed: "Noted. No judgment, just keeping you informed.",
  alternative: "Good thinking. A cheaper option could save you real money.",
  celebrate: "Fantastic choice! You've got the room for it — enjoy it.",
};

export default function OutcomePage() {
  const router = useRouter();
  const {
    decision,
    interventionResult,
    pendingPurchase,
    activeGoal,
    activeProfileId,
    updatedGoalAmount,
    resetSession,
  } = useSessionStore();

  const [xpRange, setXpRange] = useState<{ before: number; after: number } | null>(null);
  const xpAppliedRef = useRef(false);

  useEffect(() => {
    if (!decision || !interventionResult || !pendingPurchase) {
      router.replace("/dashboard");
    }
  }, [decision, interventionResult, pendingPurchase, router]);

  useEffect(() => {
    // Guards against React StrictMode's dev-only double-invoke, which would
    // otherwise award XP for the same decision twice.
    if (decision && !xpAppliedRef.current) {
      xpAppliedRef.current = true;
      setXpRange(addXP(activeProfileId, decision));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decision]);

  if (!decision || !interventionResult || !pendingPurchase || !xpRange) return null;

  function handleBackToDashboard() {
    resetSession();
    router.push("/dashboard");
  }

  // Type-safe fallback selection for confirmation string keys
  const safeMessage = CONFIRMATION_MESSAGES[decision] || "Your transaction configuration has been successfully updated.";

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-hidden flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-xl flex flex-col gap-6">
        
        {/* Header Block */}
        <header className="flex flex-col items-center text-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_30px_rgba(16,185,129,0.1)] backdrop-blur-md">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Decision Recorded</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1.5">TerpSense has updated your capital trajectory.</p>
        </header>

        {/* Card Container Layout */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-3 shadow-2xl">
          <div className="bg-zinc-950/50 rounded-2xl p-6 border border-white/5">
            <OutcomeCard
              decision={decision}
              result={interventionResult}
              purchaseAmount={pendingPurchase.amount}
              activeGoal={activeGoal}
              updatedGoalAmount={updatedGoalAmount}
              confirmationMessage={safeMessage}
              xpBefore={xpRange.before}
              xpAfter={xpRange.after}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBackToDashboard}
          className="w-full group relative overflow-hidden bg-zinc-900 border border-white/10 hover:bg-zinc-800 hover:border-white/20 text-white font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Return to Dashboard
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        </button>

      </div>
    </main>
  );
}
