"use client";

import { useEffect, useState } from "react";

const KEY = "terpsense_onboarding_seen";

export function useOnboarding() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(KEY)) setShouldShow(true);
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, "1");
    setShouldShow(false);
  }

  return { shouldShow, dismiss };
}
