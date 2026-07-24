export function KaizenLogo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Kaizen"
    >
      <rect width="32" height="32" rx="9" fill="#09090b" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" />
      {/* Ascending bars — steady, continuous improvement */}
      <rect x="8" y="18" width="4" height="7" rx="1" fill="#047857" />
      <rect x="14" y="13" width="4" height="12" rx="1" fill="#10b981" />
      <rect x="20" y="7" width="4" height="18" rx="1" fill="#34d399" />
      {/* Ascent arrow riding the bars */}
      <path
        d="M7 15.5L14.5 9.5L18.5 12.5L25 6"
        stroke="#6ee7b7"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20.5 6H25V10.5" stroke="#6ee7b7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
