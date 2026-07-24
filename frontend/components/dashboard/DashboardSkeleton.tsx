"use client";

import { TerpSenseLogo } from "@/components/dashboard/TerpSenseLogo";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-zinc-800/50 rounded-xl ${className ?? ""}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function Tile({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={`bg-zinc-900/40 border border-white/5 rounded-3xl shadow-2xl backdrop-blur-xl ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-transparent text-zinc-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 relative z-10">
        {/* Header renders for real immediately — only data-dependent regions shimmer */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 border border-white/5 rounded-3xl p-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <TerpSenseLogo />
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-950 rounded-full flex items-center justify-center border border-white/5 relative overflow-hidden">
                <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500/10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Shimmer className="h-3.5 w-28" />
                <Shimmer className="h-2.5 w-40" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <div className="flex items-center justify-center w-10 h-10 bg-zinc-800/60 rounded-xl border border-white/5">
              <span className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            </div>
            <div className="px-4 h-10 flex items-center bg-zinc-800/60 text-xs font-bold text-zinc-400 rounded-xl border border-white/5">
              Reset
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Tile className="p-6 flex items-center gap-5 h-full">
                <div className="relative flex-shrink-0 w-[100px] h-[100px]">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="12" />
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-[screenPulse_1.8s_ease-in-out_infinite]" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <Shimmer className="h-2.5 w-24" />
                  <Shimmer className="h-6 w-32" />
                  <Shimmer className="h-3 w-20" />
                </div>
              </Tile>
              <div className="grid grid-cols-2 gap-4">
                <Tile className="p-4 flex flex-col items-center justify-center gap-2">
                  <Shimmer className="h-7 w-14" />
                  <Shimmer className="h-2.5 w-12" />
                </Tile>
                <Tile className="p-4 flex flex-col items-center justify-center gap-2">
                  <Shimmer className="h-7 w-14" />
                  <Shimmer className="h-2.5 w-12" />
                </Tile>
                <Tile className="col-span-2 p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-2 flex-1">
                    <Shimmer className="h-2.5 w-28" />
                    <Shimmer className="h-5 w-20" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex-shrink-0" />
                </Tile>
              </div>
            </div>

            <Tile className="px-6 py-4 flex items-center justify-between gap-4">
              <Shimmer className="h-4 w-56" />
              <Shimmer className="h-6 w-32 rounded-lg" />
            </Tile>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Tile className="p-6 flex flex-col gap-3">
                <Shimmer className="h-2.5 w-24" />
                <Shimmer className="h-5 w-32" />
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-3/4" />
              </Tile>
              <Tile className="p-6 flex flex-col gap-3">
                <Shimmer className="h-2.5 w-24" />
                {[0, 1, 2, 3].map((i) => (
                  <Shimmer key={i} className="h-3 w-full" />
                ))}
              </Tile>
            </div>

            <Tile className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Shimmer className="h-2.5 w-24" />
                <Shimmer className="h-4 w-10" />
              </div>
              <Shimmer className="h-3 w-full" />
            </Tile>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-3xl py-5 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="w-4 h-4 border-2 border-emerald-500/40 border-t-emerald-400 rounded-full animate-spin" />
            </div>

            <Tile className="flex-1 flex flex-col min-h-[400px] overflow-hidden">
              <div className="px-6 py-5 border-b border-white/5">
                <Shimmer className="h-2.5 w-28" />
              </div>
              <div className="flex-1 p-2 flex flex-col gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 mx-2 my-1">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-zinc-950 border border-white/5 rounded-xl flex-shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <Shimmer className="h-3 w-24" />
                        <Shimmer className="h-2.5 w-32" />
                      </div>
                    </div>
                    <Shimmer className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </Tile>
          </div>
        </div>
      </div>
    </main>
  );
}
