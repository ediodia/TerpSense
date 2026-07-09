import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
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
  Other: "•",
};

export function TransactionList({ transactions }: TransactionListProps) {
  const recent = transactions.slice(0, 7);

  return (
    <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="px-6 py-5 border-b border-white/5 bg-zinc-900/20">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          Recent Activity
        </p>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
        {recent.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 mx-2 my-1 rounded-2xl hover:bg-zinc-800/40 transition-colors border border-transparent hover:border-white/5 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-center text-lg shadow-inner transition-transform duration-300 group-hover:scale-105">
                {CATEGORY_ICONS[tx.category] ?? "💳"}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-100 tracking-tight">
                  {tx.merchant}
                </p>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">
                  {tx.category} • {formatDate(tx.date)}
                </p>
              </div>
            </div>
            <span
              className={`text-sm font-black ${
                tx.category === "Clothing" ? "text-orange-400" : "text-zinc-100"
              }`}
            >
              -{formatCurrency(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}