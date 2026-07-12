export function TerpSenseLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 20, text: "text-sm" },
    md: { icon: 28, text: "text-lg" },
    lg: { icon: 40, text: "text-2xl" },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2">
      <svg width={s.icon} height={s.icon} viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#DC2626" />
        <path
          d="M16 4L8 15h7l-3 9 11-13h-7l3-7z"
          fill="#FBBF24"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`${s.text} font-black tracking-tight`}>
        <span className="text-white">Terp</span>
        <span className="text-red-500">Sense</span>
      </span>
    </div>
  )
}