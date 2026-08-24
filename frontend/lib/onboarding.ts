"use client";

import { useEffect, useState } from "react";

function key(mode: "mock" | "personal"): string {
  return mode === "personal" ? "terpsense_onboarding_seen_personal" : "terpsense_onboarding_seen";
}

export function useOnboarding(mode: "mock" | "personal" = "mock") {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(key(mode))) setShouldShow(true);
    else setShouldShow(false);
  }, [mode]);

  function dismiss() {
    if (typeof window !== "undefined") window.localStorage.setItem(key(mode), "1");
    setShouldShow(false);
  }

  return { shouldShow, dismiss };
}
