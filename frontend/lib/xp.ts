const XP_DELTAS: Record<string, number> = {
  redirect: 75,
  alternative: 75,
  delay: 40,
  proceed: 10,
};

function key(profileId: string): string {
  return `terpsense_xp_${profileId}`;
}

export function getXP(profileId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(key(profileId));
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function xpDeltaForDecision(decision: string): number {
  return XP_DELTAS[decision] ?? 0;
}

/** Adds XP for a profile and returns the {before, after} totals so callers can animate the delta. */
export function addXP(profileId: string, decision: string): { before: number; after: number } {
  const before = getXP(profileId);
  const after = before + xpDeltaForDecision(decision);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key(profileId), String(after));
  }
  return { before, after };
}
