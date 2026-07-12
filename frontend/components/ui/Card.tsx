import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  padded?: boolean;
  /** Glass = frosted translucent surface (default, matches app-wide style). Solid = opaque, for nested/inner cards. */
  variant?: "glass" | "solid";
  /** Adds a subtle colored glow shadow, matching severity/status cards elsewhere in the app */
  glow?: "none" | "emerald" | "orange" | "red" | "blue" | "purple";
  hoverable?: boolean;
}

const variantClasses = {
  glass: "bg-zinc-900/40 backdrop-blur-xl border border-white/5 shadow-2xl",
  solid: "bg-zinc-950/50 border border-white/5",
};

const glowClasses = {
  none: "",
  emerald: "shadow-[0_0_30px_rgba(16,185,129,0.08)]",
  orange: "shadow-[0_0_30px_rgba(249,115,22,0.08)]",
  red: "shadow-[0_0_30px_rgba(239,68,68,0.08)]",
  blue: "shadow-[0_0_30px_rgba(59,130,246,0.08)]",
  purple: "shadow-[0_0_30px_rgba(168,85,247,0.08)]",
};

export function Card({
  title,
  padded = true,
  variant = "glass",
  glow = "none",
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl transition-colors",
        variantClasses[variant],
        glowClasses[glow],
        padded && "p-5",
        hoverable && "hover:bg-zinc-800/40 hover:border-white/10",
        className
      )}
      {...props}
    >
      {title && (
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}