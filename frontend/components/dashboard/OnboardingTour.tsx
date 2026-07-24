"use client";

import { useLayoutEffect, useState } from "react";

export interface TourStep {
  target: string; // matches a data-tour="..." attribute
  title: string;
  description: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onDone: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measure(selector: string): Rect | null {
  const el = document.querySelector(`[data-tour="${selector}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function OnboardingTour({ steps, onDone }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  useLayoutEffect(() => {
    function recompute() {
      setRect(measure(step.target));
    }
    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Re-measure shortly after in case smooth-scroll is still animating
    const t = setTimeout(recompute, 350);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
      clearTimeout(t);
    };
  }, [step.target]);

  function next() {
    if (isLast) {
      onDone();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  const pad = 8;
  const tooltipBelow = rect ? rect.top < window.innerHeight * 0.55 : true;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />

      {/* Spotlight ring around the target */}
      {rect && (
        <div
          className="absolute rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_0_4000px_rgba(0,0,0,0.55),0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute w-[300px] bg-zinc-900 border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-300 animate-fade-in"
        style={
          rect
            ? {
                top: tooltipBelow ? rect.top + rect.height + pad + 12 : undefined,
                bottom: !tooltipBelow ? window.innerHeight - rect.top + pad + 12 : undefined,
                left: Math.min(Math.max(rect.left, 16), window.innerWidth - 316),
              }
            : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        }
      >
        <div className="flex items-center gap-1.5 mb-3">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-5 bg-emerald-400" : "w-1.5 bg-zinc-700"
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-black text-white tracking-tight mb-1.5">{step.title}</p>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{step.description}</p>
        <div className="flex items-center justify-between">
          <button
            onClick={onDone}
            className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                onClick={back}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              {isLast ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
