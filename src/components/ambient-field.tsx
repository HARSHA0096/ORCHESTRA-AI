import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * AmbientField — the "alive" backdrop for Orchestra AI.
 *
 * Three layers, all GPU-accelerated (transform/opacity only):
 *  1. Aurora mesh blobs (already partially in styles.css; this adds motion-driven drift)
 *  2. Floating particles — lightweight canvas, ~40 nodes, soft glow, slow drift
 *  3. A faint scanning beam that sweeps the viewport to suggest telemetry/activity
 *
 * Rendered once, fixed, behind everything (z-index -1), pointer-events: none.
 * Pauses particle animation when the tab is hidden to save battery/CPU.
 */
export function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; r: number; vx: number; vy: number; hue: number; o: number };
    let particles: P[] = [];

    const colors = [
      "189, 224, 254", // cyan-ish
      "147, 197, 253", // blue
      "165, 180, 252", // violet
    ];

    function resize() {
      const { innerWidth: w, innerHeight: h } = window;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.scale(dpr, dpr);

      const count = Math.min(48, Math.round((w * h) / 38000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.6,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12 - 0.04,
        hue: Math.floor(Math.random() * colors.length),
        o: Math.random() * 0.5 + 0.15,
      }));
    }

    function tick() {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(${colors[p.hue]}, ${p.o})`);
        grad.addColorStop(1, `rgba(${colors[p.hue]}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(${colors[p.hue]}, ${Math.min(p.o + 0.3, 0.9)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Particle field */}
      {!reduce && <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />}

      {/* Scanning beam — a slow diagonal sweep suggesting live telemetry */}
      {!reduce && (
        <motion.div
          className="absolute -left-1/2 top-0 h-[200%] w-1/3 -skew-x-12"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.82 0.16 210 / 0.05), transparent)",
          }}
          animate={{ x: ["0vw", "220vw"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear", repeatDelay: 6 }}
        />
      )}
    </div>
  );
}
