"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { TransactionCategory } from "@/types";

const CATEGORIES: TransactionCategory[] = [
  "Clothing",
  "Dining",
  "Entertainment",
  "Transport",
  "Subscriptions",
  "Health",
  "Shopping",
  "Other",
];

const QUICK_AMOUNTS = [10, 25, 50, 100];

interface PurchaseFormProps {
  onSubmit: (amount: number, category: TransactionCategory, merchant?: string) => void;
  isLoading: boolean;
  onChange?: (amount: string, category: TransactionCategory) => void;
}

export function PurchaseForm({ onSubmit, isLoading, onChange }: PurchaseFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Clothing");
  const [merchant, setMerchant] = useState("");
  const [error, setError] = useState("");

  function updateAmount(next: string) {
    setAmount(next);
    onChange?.(next, category);
  }

  function updateCategory(next: TransactionCategory) {
    setCategory(next);
    onChange?.(amount, next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid amount greater than $0.");
      return;
    }
    setError("");
    onSubmit(parsed, category, merchant.trim() || undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Purchase Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">
            $
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => updateAmount(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3.5 text-zinc-100 text-lg font-medium placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>
        <div className="flex gap-2 mt-2.5">
          {QUICK_AMOUNTS.map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => updateAmount(String(quick))}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                amount === String(quick)
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                  : "bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:text-zinc-200 hover:border-zinc-600"
              }`}
            >
              ${quick}
            </button>
          ))}
        </div>
        {error && <p className="text-red-400 text-sm mt-1.5">{error}</p>}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Category
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateCategory(c)}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all cursor-pointer ${
                category === c
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                  : "bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
              }`}
            >
              <span className="text-lg leading-none">{CATEGORY_ICONS[c] ?? "💳"}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">{c}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Merchant{" "}
          <span className="text-zinc-600 normal-case tracking-normal font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. ASOS, Chipotle, Spotify"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
      </div>

      <Button type="submit" fullWidth size="lg" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing your spending...
          </span>
        ) : (
          "Check This Purchase"
        )}
      </Button>
    </form>
  );
}
