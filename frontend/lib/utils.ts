export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// --- Shared design tokens ---
export type Severity = "green" | "yellow" | "orange" | "red";

export type SeverityConfig = {
  label: string;
  text: string;
  border: string;
  bg: string;
  dot: string;
  glow: string;
  gradient: string;
};

export const SEVERITY_TOKENS: Record<Severity, SeverityConfig> = {
  green: {
    label: "Fantastic Choice!",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.12)]",
    gradient: "from-emerald-500/5",
  },
  yellow: {
    label: "Heads Up",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    dot: "bg-yellow-500",
    glow: "shadow-[0_0_40px_rgba(234,179,8,0.12)]",
    gradient: "from-yellow-500/5",
  },
  orange: {
    label: "Watch Out",
    text: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
    dot: "bg-orange-500",
    glow: "shadow-[0_0_40px_rgba(249,115,22,0.15)]",
    gradient: "from-orange-500/5",
  },
  red: {
    label: "Risky Move",
    text: "text-red-400",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    dot: "bg-red-500",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.18)]",
    gradient: "from-red-500/5",
  },
};