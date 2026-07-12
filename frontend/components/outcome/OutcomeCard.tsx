"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { Decision, Goal, InterventionResult } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface OutcomeCardProps {
  decision: Decision;
  result: InterventionResult;
  purchaseAmount: number;
  activeGoal: Goal | null;
  updatedGoalAmount: number | null;
  confirmationMessage: string;
}

/* ---------------- REDIRECT: mega confetti burst ---------------- */
function MegaConfetti() {
  const colors = ["#ef4444", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#f97316", "#10b981", "#ec4899"];
  const pieces = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 6 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.6,
        duration: Math.random() * 1.5 + 1.8,
        drift: (Math.random() - 0.5) * 300,
        spin: Math.random() * 1080 + 360,
        shape: Math.random() > 0.6 ? "50%" : "2px",
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-24px",
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            borderRadius: p.shape,
            animation: `confettiBurst ${p.duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${p.delay}s forwards`,
            // @ts-ignore custom props
            "--drift": `${p.drift}px`,
            "--spin": `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- DELAY: hourglass + desert + pyramids ---------------- */
function DesertHourglassScene() {
  const sandGrains = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: 46 + Math.random() * 8,
        delay: Math.random() * 3,
        duration: 2.4 + Math.random() * 1.2,
      })),
    []
  );

  return (
    <div className="relative w-full h-56 overflow-hidden rounded-2xl bg-gradient-to-b from-amber-950/40 via-amber-900/20 to-amber-950/60 border border-amber-500/10">
      <div
        className="absolute top-4 right-8 w-10 h-10 rounded-full bg-amber-400"
        style={{ animation: "sunPulse 2.5s ease-in-out infinite" }}
      />
      <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 400 100" preserveAspectRatio="none">
        <polygon points="40,90 90,20 140,90" fill="#78350f" opacity="0.55" />
        <polygon points="120,90 175,10 230,90" fill="#92400e" opacity="0.7" />
        <polygon points="220,90 270,28 320,90" fill="#78350f" opacity="0.5" />
        <rect x="0" y="88" width="400" height="12" fill="#451a03" opacity="0.6" />
      </svg>
      <div
        className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-amber-700/30 to-transparent"
        style={{ animation: "duneShimmer 3s ease-in-out infinite" }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-20 h-32 flex flex-col items-center">
          <div className="w-20 h-14 border-2 border-amber-300/70 rounded-t-md bg-amber-950/40 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-3 bg-amber-400/80" />
          </div>
          <div className="w-1.5 h-4 bg-amber-300/50" />
          <div className="w-20 h-14 border-2 border-amber-300/70 rounded-b-md bg-amber-950/40 relative overflow-hidden flex items-end">
            <div className="w-full h-8 bg-amber-400/70 rounded-t-full" />
          </div>

          {sandGrains.map((g) => (
            <div
              key={g.id}
              className="absolute w-1 h-1 rounded-full bg-amber-300"
              style={{
                left: `${g.left}%`,
                top: "60px",
                animation: `sandFallFull ${g.duration}s linear ${g.delay}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- ALTERNATIVE: spy scanning with magnifying glass ---------------- */
function SpyScanner() {
  return (
    <div className="relative w-full h-40 overflow-hidden rounded-2xl bg-purple-950/20 border border-purple-500/10">
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 gap-1 p-3 opacity-40">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="bg-purple-500/20 rounded-sm" />
        ))}
      </div>

      <div
        className="absolute top-6 left-6 flex items-center justify-center"
        style={{ animation: "spyScan 4s ease-in-out infinite" }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-purple-300 bg-purple-400/10 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-purple-200/30"
              style={{ animation: "lensGleam 2s ease-in-out infinite" }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-lg">🕵️</span>
          </div>
          <div className="absolute -bottom-3 -right-3 w-6 h-1.5 bg-purple-300 rotate-45 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- PROCEED: literal Japanese exit sign, running man ---------------- */
function ExitSignRunner() {
  return (
    <div
      className="relative w-full h-80 overflow-hidden rounded-2xl bg-[#0a0c0a] border border-white/5"
      style={{ animation: "sceneFadeIn 0.6s ease-out forwards" }}
    >
      {/* Perforated ceiling */}
      <div
        className="absolute top-0 left-0 w-full h-24"
        style={{
          background:
            "repeating-linear-gradient(90deg, #1c1f1c 0px, #1c1f1c 2px, #141614 2px, #141614 6px)",
          backgroundColor: "#17191a",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
            opacity: 0.15,
          }}
        />
        <div className="absolute -bottom-2 left-1/4 w-24 h-24 bg-white/20 blur-2xl rounded-full" style={{ animation: "ceilingLightPulse 3s ease-in-out infinite" }} />
      </div>

      {/* Ceiling seam line */}
      <div className="absolute top-24 left-0 w-full h-px bg-white/10" />

      {/* Glass doors / wall below */}
      <div className="absolute top-24 left-0 w-full h-56 bg-gradient-to-b from-zinc-900/60 to-zinc-950" />
      <div className="absolute top-24 left-1/2 w-px h-56 bg-white/10" />
      <div className="absolute bottom-6 left-[15%] w-9 h-9 rounded-full border border-white/10 bg-zinc-800/40" />
      <div className="absolute bottom-6 right-[15%] w-9 h-9 rounded-full border border-white/10 bg-zinc-800/40" />

      {/* Hanging cable + sign fixture */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col items-center" style={{ animation: "cableSwing 4s ease-in-out infinite", transformOrigin: "top center" }}>
        <div className="w-0.5 h-6 bg-zinc-600" />
        <div className="relative w-56 border-4 border-zinc-200 rounded-md shadow-[0_10px_50px_rgba(16,185,129,0.4)]" style={{ animation: "signFlicker 5s linear infinite" }}>
          <div className="bg-emerald-600 h-20 flex items-center px-3 relative overflow-hidden">
            <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.3)" }} />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 z-10">
              <span className="text-white font-black text-base tracking-widest leading-none">非常口</span>
              <span className="text-white font-bold text-[10px] tracking-[0.3em] leading-none mt-1">EXIT</span>
            </div>
          </div>
        </div>
        {/* fixture housing bar */}
        <div className="w-56 h-1.5 bg-zinc-700 border-t border-white/10" />
      </div>

      {/* Running silhouette — full traverse of the scene at large scale */}
      <div
        className="absolute bottom-6"
        style={{ animation: "stationRunnerDash 2.4s cubic-bezier(0.4,0,0.6,1) infinite" }}
      >
        <span
          className="block text-6xl select-none drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          style={{ animation: "stationLegStride 0.28s ease-in-out infinite alternate" }}
        >
          🏃
        </span>
      </div>

      {/* Floor reflection strip */}
      <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-emerald-500/5 to-transparent" />
    </div>
  );
}

function XPBar({ xp }: { xp: number }) {
  const [filled, setFilled] = useState(0);
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;

  useEffect(() => {
    setTimeout(() => setFilled(progress), 300);
  }, [progress]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Financial IQ</span>
        <span className="text-xs text-yellow-400 font-bold">Level {level}</span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${filled}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600 mt-1">{progress}/100 XP to Level {level + 1}</p>
    </div>
  );
}

function BeforeAfterSplit({ purchaseAmount, savedAmount, goalName }: { purchaseAmount: number; savedAmount: number; goalName: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
        <p className="text-xs text-red-400 uppercase tracking-widest font-bold mb-2">If you bought it</p>
        <p className="text-2xl font-black text-red-400">-{formatCurrency(purchaseAmount)}</p>
        <p className="text-xs text-zinc-500 mt-1">Gone forever</p>
        <p className="text-xs text-red-400/60 mt-2">❌ Goal delayed</p>
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
        <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-2">What you did</p>
        <p className="text-2xl font-black text-emerald-400">+{formatCurrency(savedAmount)}</p>
        <p className="text-xs text-zinc-500 mt-1">Working for you</p>
        <p className="text-xs text-emerald-400/60 mt-2">✅ {goalName} closer</p>
      </div>
    </div>
  );
}

export function OutcomeCard({
  decision,
  result,
  purchaseAmount,
  activeGoal,
  updatedGoalAmount,
  confirmationMessage,
}: OutcomeCardProps) {
  const goalTarget = activeGoal?.target_amount ?? 1000;
  const newAmount = updatedGoalAmount ?? (activeGoal?.current_amount ?? 0);
  const newPercent = Math.round((newAmount / goalTarget) * 100);
  const oldPercent = activeGoal ? Math.round((activeGoal.current_amount / goalTarget) * 100) : 0;
  const [showConfetti, setShowConfetti] = useState(false);
  const [xp, setXp] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (decision === "redirect") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3800);
      setXp(75);
      playWinSound();
    } else if (decision === "alternative") {
      setXp(75);
      playWinSound();
    } else if (decision === "delay") {
      setXp(40);
    } else {
      setXp(10);
    }
  }, [decision]);

  function playWinSound() {
    try {
      const ctx = new AudioContext();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch (e) {
      // Audio not available
    }
  }

  if (decision === "redirect") {
    return (
      <div className="space-y-5">
        {showConfetti && <MegaConfetti />}

        <div className="text-center pt-2">
          <div className="text-5xl mb-3 animate-bounce">🎯</div>
          <h2 className="text-2xl font-bold text-emerald-400">Smart move.</h2>
          <p className="text-zinc-400 mt-1 text-sm">{confirmationMessage}</p>
        </div>

        <BeforeAfterSplit purchaseAmount={purchaseAmount} savedAmount={purchaseAmount} goalName={activeGoal?.name ?? "your goal"} />

        {activeGoal && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-zinc-300">{activeGoal.name}</p>
              <p className="text-xs text-zinc-500">
                {formatCurrency(activeGoal.current_amount)} → {formatCurrency(newAmount)}
              </p>
            </div>
            <ProgressBar value={newPercent} animated color="emerald" />
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              <span>Was {oldPercent}%</span>
              <span className="text-emerald-400 font-semibold">Now {newPercent}%</span>
            </div>
          </div>
        )}

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-zinc-400">
            In 6 months at 5% APY, this <span className="text-emerald-400 font-medium">{formatCurrency(purchaseAmount)}</span> becomes{" "}
            <span className="text-emerald-400 font-medium">{formatCurrency(result.redirect_value_6mo)}</span>
          </p>
        </div>

        <XPBar xp={xp} />
      </div>
    );
  }

  if (decision === "delay") {
    return (
      <div className="text-center space-y-4 pt-2">
        <DesertHourglassScene />
        <h2 className="text-2xl font-bold text-amber-400">See you in 7 days.</h2>
        <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Pending</p>
          <p className="text-sm text-zinc-300">{formatCurrency(purchaseAmount)} purchase — check back in 7 days.</p>
          <p className="text-xs text-zinc-500 mt-1">If you still want it then, it was probably worth it.</p>
        </div>
        <XPBar xp={xp} />
      </div>
    );
  }

  if (decision === "alternative") {
    return (
      <div className="text-center space-y-4 pt-2">
        {showConfetti && <MegaConfetti />}
        <SpyScanner />
        <h2 className="text-2xl font-bold text-purple-400">Good thinking.</h2>
        <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
        {result.alternative_suggestion && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-left">
            <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold mb-2">Suggested alternative</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.alternative_suggestion}</p>
          </div>
        )}
        <XPBar xp={xp} />
      </div>
    );
  }

  return (
    <div className="text-center space-y-4 pt-2">
      <ExitSignRunner />
      <h2 className="text-2xl font-bold text-emerald-400">Noted.</h2>
      <p className="text-zinc-400 text-sm">{confirmationMessage}</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left">
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-2">Keep in mind</p>
        <p className="text-sm text-zinc-400 leading-relaxed">
          TerpSense isn't here to stop you — just to make sure you know the full picture before you decide.
        </p>
      </div>
      <XPBar xp={xp} />
    </div>
  );
}