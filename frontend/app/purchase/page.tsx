"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { analyzePurchase } from "@/lib/api";
import type { TransactionCategory } from "@/types";
import { PurchaseForm } from "@/components/purchase/PurchaseForm";
import { useSessionStore } from "@/store/sessionStore";
import { CATEGORY_ICONS, BIWEEKLY_BUDGET } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function PurchasePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewAmount, setPreviewAmount] = useState("");
  const [previewCategory, setPreviewCategory] = useState<TransactionCategory>("Clothing");

  const { setPendingPurchase, setInterventionResult, activeProfileId, spendingSummary } = useSessionStore();

  const parsedPreviewAmount = parseFloat(previewAmount);
  const hasPreviewAmount = !isNaN(parsedPreviewAmount) && parsedPreviewAmount > 0;
  const categorySpentThisWeek = spendingSummary?.week[previewCategory] ?? 0;
  const categoryAvg = spendingSummary?.category_weekly_averages[previewCategory] ?? 0;
  const projectedCategorySpend = categorySpentThisWeek + (hasPreviewAmount ? parsedPreviewAmount : 0);
  const isOverAverage = categoryAvg > 0 && projectedCategorySpend > categoryAvg;
  const totalSpentThisWeek = spendingSummary
    ? Object.values(spendingSummary.week).reduce((a, b) => a + b, 0)
    : 0;
  const budgetHeadroom = Math.max(0, BIWEEKLY_BUDGET - totalSpentThisWeek);

  async function handleSubmit(
    amount: number,
    category: TransactionCategory,
    merchant?: string
  ) {
    setIsLoading(true);
    setError("");

    try {
      // Synchronously stage state inside client data layer
      setPendingPurchase({ amount, category, merchant });

      const result = await analyzePurchase({
        user_id: "demo",
        amount,
        category,
        merchant,
        profile_id: activeProfileId,
      });

      setInterventionResult(result);
      router.push("/intervention");
    } catch (err) {
      console.error("Purchase evaluation error caught:", err);
      setError("Analysis failed. Please verify the backend is active and try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6">
      {/* Background Radial Ambient Mesh Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col gap-6">

        {/* Navigation Block */}
        <header className="flex items-center gap-4 mb-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900/80 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all shadow-sm backdrop-blur-md"
          >
            ←
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Evaluate Transaction</h1>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">
              Enter transaction parameters for AI assessment
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 items-start">
          {/* Form Container Wrapper Layout */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-3 shadow-2xl relative">
            {isLoading && (
              <div className="absolute inset-0 z-20 bg-[#09090b]/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <div className="flex gap-1.5 items-center bg-zinc-900 border border-white/10 px-4 py-3 rounded-2xl shadow-xl">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-bold text-zinc-300 ml-2">Running Analysis</span>
                </div>
              </div>
            )}

            <div className="bg-zinc-950/50 rounded-2xl p-6 border border-white/5">
              <PurchaseForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onChange={(amt, cat) => {
                  setPreviewAmount(amt);
                  setPreviewCategory(cat);
                }}
              />
            </div>
          </div>

          {/* Live preview panel — reflects real spending data as the form is filled in */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center text-base shadow-inner">
                {CATEGORY_ICONS[previewCategory] ?? "💳"}
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight">{previewCategory}</p>
                <p className="text-[10px] font-medium text-zinc-500">This week's context</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Spent so far</span>
                <span className="text-zinc-200 font-bold">{formatCurrency(categorySpentThisWeek)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Typical average</span>
                <span className="text-zinc-200 font-bold">{formatCurrency(categoryAvg)}</span>
              </div>
              {hasPreviewAmount && (
                <div className="flex justify-between items-center pt-2.5 border-t border-white/5">
                  <span className="text-zinc-500 font-medium">With this purchase</span>
                  <span className={`font-black ${isOverAverage ? "text-orange-400" : "text-emerald-400"}`}>
                    {formatCurrency(projectedCategorySpend)}
                  </span>
                </div>
              )}
              {hasPreviewAmount && isOverAverage && (
                <p className="text-[10px] font-medium text-orange-400/80 leading-relaxed">
                  ⚠️ This would push {previewCategory.toLowerCase()} above your typical weekly pace.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Budget headroom</p>
              <p className="text-lg font-black text-white">{formatCurrency(budgetHeadroom)}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">left in this biweekly budget</p>
            </div>
          </div>
        </div>

        {/* Dynamic Error Messaging Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 font-bold text-sm">
              !
            </div>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Dev Environment Simulation Controls */}
        {!isLoading && (
          <button
            type="button"
            onClick={() => handleSubmit(89, "Clothing", "ASOS")}
            className="w-full group flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 cursor-pointer"
          >
            Run Simulation: $89 ASOS Transaction
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        )}
      </div>
    </main>
  );
}