import Link from "next/link";

export function TerpSenseLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="relative z-10">
          <rect width="32" height="32" rx="10" fill="#09090b" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" />
          <ellipse cx="16" cy="16" rx="8" ry="6" fill="#10b981" />
          <ellipse cx="16" cy="16" rx="5" ry="4" fill="#059669" />
          <line x1="16" y1="12" x2="16" y2="20" stroke="#047857" strokeWidth="1" />
          <line x1="11" y1="16" x2="21" y2="16" stroke="#047857" strokeWidth="1" />
          <line x1="12" y1="13" x2="20" y2="19" stroke="#047857" strokeWidth="1" />
          <line x1="20" y1="13" x2="12" y2="19" stroke="#047857" strokeWidth="1" />
          <ellipse cx="24" cy="14" rx="2.5" ry="2" fill="#10b981" />
          <ellipse cx="8.5" cy="17" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="13" cy="22" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="19" cy="22" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="13" cy="10" rx="1.5" ry="1" fill="#10b981" />
          <ellipse cx="19" cy="10" rx="1.5" ry="1" fill="#10b981" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
        Terp<span className="text-emerald-500 font-black">Sense</span>
      </span>
    </Link>
  );
}