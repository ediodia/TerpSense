"use client";

import { useEffect, useState } from "react";

interface StreakRecord {
  count: number;
  lastVisit: string; // Date.toDateString()
}

function key(profileId: string): string {
  return `terpsense_streak_${profileId}`;
}

function yesterday(today: Date): string {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return d.toDateString();
}

/**
 * Real per-profile login streak, persisted in localStorage and keyed off the
 * actual wall-clock date (not the pinned demo spending date). Increments once
 * per calendar day on consecutive visits; resets after a gap.
 */
export function useLoginStreak(profileId: string): { streak: number; justIncremented: boolean } {
  const [streak, setStreak] = useState(0);
  const [justIncremented, setJustIncremented] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !profileId) return;

    const today = new Date();
    const todayStr = today.toDateString();
    const raw = window.localStorage.getItem(key(profileId));
    const stored: StreakRecord | null = raw ? JSON.parse(raw) : null;

    let nextCount: number;
    let incremented: boolean;

    if (!stored) {
      nextCount = 1;
      incremented = true;
    } else if (stored.lastVisit === todayStr) {
      nextCount = stored.count;
      incremented = false;
    } else if (stored.lastVisit === yesterday(today)) {
      nextCount = stored.count + 1;
      incremented = true;
    } else {
      nextCount = 1;
      incremented = true;
    }

    window.localStorage.setItem(key(profileId), JSON.stringify({ count: nextCount, lastVisit: todayStr }));
    setStreak(nextCount);
    setJustIncremented(incremented);
  }, [profileId]);

  return { streak, justIncremented };
}
