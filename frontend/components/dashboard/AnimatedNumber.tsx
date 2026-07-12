"use client";

import { useEffect, useState } from "react";

export function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 1000 / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}