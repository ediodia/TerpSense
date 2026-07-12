import { cn } from "@/lib/utils";

type BadgeColor = "yellow" | "orange" | "red" | "green" | "zinc" | "blue" | "purple";

interface BadgeProps {
  color: BadgeColor;
  children: React.ReactNode;
  className?: string;
  /** Show a small pulsing status dot before the label */
  dot?: boolean;
  /** Uppercase, wide-tracking label style used on severity/status badges */
  uppercase?: boolean;
  size?: "sm" | "md";
}

const colorClasses: Record<BadgeColor, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    dot: "bg-yellow-500",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.15)]",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    dot: "bg-purple-500",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
  },
  zinc: {
    bg: "bg-zinc-800",
    text: "text-zinc-400",
    border: "border-zinc-700",
    dot: "bg-zinc-500",
    glow: "",
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({ color, children, className, dot = false, uppercase = false, size = "md" }: BadgeProps) {
  const c = colorClasses[color];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md font-bold transition-all",
        c.bg,
        c.text,
        c.border,
        c.glow,
        sizeClasses[size],
        uppercase && "uppercase tracking-widest",
        !uppercase && "font-semibold",
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", c.dot)} />
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", c.dot)} />
        </span>
      )}
      {children}
    </span>
  );
}