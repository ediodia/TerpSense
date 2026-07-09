"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.setProperty("--x", `${e.clientX}px`);
        glowRef.current.style.setProperty("--y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    // Added bg-[#09090b] here to hard-lock the dark canvas globally
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#09090b]">
      <div
        ref={glowRef}
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `
            radial-gradient(
              600px circle at var(--x, 50vw) var(--y, 50vh), 
              rgba(16, 185, 129, 0.07), 
              transparent 40%
            )
          `,
        }}
      />
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full mix-blend-screen" />
    </div>
  );
}