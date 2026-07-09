'use client';

interface SeverityBadgeProps {
  severity: 'yellow' | 'orange' | 'red';
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = {
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-500", glow: "shadow-[0_0_15px_rgba(234,179,8,0.15)]", label: "Heads Up" },
    orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", dot: "bg-orange-500", glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]", label: "Watch Out" },
    red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-500", glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]", label: "Risky Move" },
  };

  const { bg, border, text, dot, glow, label } = config[severity] || config.yellow;

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all ${bg} ${border} ${glow}`}>
      <div className="relative flex h-1.5 w-1.5 items-center justify-center">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 duration-1000 ${dot}`} />
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dot}`} />
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest ${text}`}>{label}</span>
    </div>
  );
}