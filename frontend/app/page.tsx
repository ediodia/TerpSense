import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 flex flex-col min-h-screen">
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-black">
              T
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Terp<span className="text-emerald-500 font-black">Sense</span>
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
          >
            Skip to dashboard →
          </Link>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 pb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Real-time AI financial intervention
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.05] max-w-3xl">
            Stop bad decisions <span className="text-emerald-400">before</span> they happen.
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl font-medium leading-relaxed">
            TerpSense catches risky purchases before checkout, grounds every insight in your real spending data, and turns saving money into something that feels like winning.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <Link
              href="/dashboard"
              className="group relative overflow-hidden inline-flex items-center gap-2 bg-emerald-500 text-zinc-950 font-black px-8 py-4 rounded-2xl text-base shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(16,185,129,0.3)]"
            >
              Get started
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
          {[
            { icon: "🎯", title: "Real-time intervention", desc: "Flags risky purchases before checkout, not after the money's gone." },
            { icon: "📊", title: "Grounded in your data", desc: "Every insight cites a real number from your actual spending." },
            { icon: "🔍", title: "Smarter alternatives", desc: "Get a concrete cheaper option instead of just being told no." },
            { icon: "🔥", title: "Built to gamify saving", desc: "Streaks, XP, and goal progress make saving feel like winning." },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 hover:border-emerald-500/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}