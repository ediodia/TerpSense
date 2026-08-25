// Ambient colored dots drifting slowly across the whole app — mounted once
// globally (see layout.tsx) so every page gets the same "alive" background
// without each page needing its own copy. Positions/timings are derived
// deterministically from the index (not Math.random()) so server and client
// render identically and there's no hydration mismatch to work around.
const COLORS = ["#10b981", "#ec4899", "#a855f7", "#3b82f6", "#2dd4bf"];
const PARTICLE_COUNT = 24;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const top = (i * 37 + 13) % 100;
  const left = (i * 53 + 7) % 100;
  const size = 4 + (i % 4) * 2;
  const color = COLORS[i % COLORS.length];
  const driftDuration = 10 + (i % 6) * 2;
  const twinkleDuration = 3 + (i % 4);
  const delay = (i % 5) * 0.8;
  const dx = ((i % 3) - 1) * 24;
  const dy = -26 - (i % 4) * 8;

  return { top, left, size, color, driftDuration, twinkleDuration, delay, dx, dy };
});

export function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.size}px ${p.color}`,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            animation: `particleDrift ${p.driftDuration}s ease-in-out ${p.delay}s infinite, particleTwinkle ${p.twinkleDuration}s ease-in-out ${p.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
