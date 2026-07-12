import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  /** Adds the diagonal shine-sweep hover effect used on primary CTAs */
  shine?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20",
  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium border border-zinc-700",
  ghost:
    "bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 font-medium",
  danger:
    "bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium border border-red-500/30",
  outline:
    "bg-transparent hover:bg-white/5 text-zinc-200 font-medium border border-white/10 hover:border-white/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-xl gap-2.5",
};

function Spinner({ size }: { size: Size }) {
  const dim = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return <span className={cn(dim, "border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0")} />;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  shine = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && <Spinner size={size} />}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {shine && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
      )}
    </button>
  );
}