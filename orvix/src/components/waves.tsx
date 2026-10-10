"use client";
import { useEffect, useRef } from "react";

/**
 * Animated "streams" inspired by the Orvix logo: a glossy droplet head,
 * a tapering tail, then a run of dashes with round knobs that flow to the
 * right and get shorter, coloured magenta → violet → blue → cyan.
 * Pauses when off-screen or when the tab is hidden; static with reduced motion.
 */
export function Waves({
  streams = 6,
  className = "",
  seed = 7,
  spread = 1,
  headScale = 1,
}: {
  streams?: number;
  className?: string;
  seed?: number;
  /** 0..1, how much of the height the streams use */
  spread?: number;
  headScale?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true, start = performance.now();

    // Deterministic pseudo-random so the composition is identical on each load.
    let s = seed >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);

    const defs = Array.from({ length: streams }, (_, i) => ({
      y: (i + 0.5) / streams,
      x0: 0.03 + rnd() * 0.2,
      x1: 0.86 + rnd() * 0.12,
      r: 0.55 + rnd() * 0.55,
      amp: 0.5 + rnd() * 0.7,
      freq: 0.8 + rnd() * 1.1,
      phase: rnd() * Math.PI * 2,
      speed: 0.35 + rnd() * 0.4,
      tilt: (rnd() - 0.5) * 0.9,
      breakAt: 0.18 + rnd() * 0.42,
      period: 0.55 + rnd() * 0.35,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      const t = (time - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(w * 0.02, 0, w * 0.98, 0);
      grad.addColorStop(0, "#F500FF");
      grad.addColorStop(0.32, "#A21CF9");
      grad.addColorStop(0.58, "#6A2DFB");
      grad.addColorStop(0.82, "#0D66FE");
      grad.addColorStop(1, "#00C2FF");
      ctx.strokeStyle = grad;
      ctx.fillStyle = grad;
      ctx.lineCap = "round";

      const band = h * spread;
      const top = (h - band) / 2;
      const unit = Math.min(band / streams, 90);

      for (const d of defs) {
        const x0 = d.x0 * w, x1 = d.x1 * w;
        const baseY = top + d.y * band;
        const R = unit * 0.3 * d.r * headScale;
        const bob = Math.sin(t * 0.7 + d.phase) * unit * 0.05;

        // Streams fan in towards a point on the right, like the logo, and ripple as they flow.
        const focusY = top + band * 0.42;
        const ease = (u: number) => u * u * (3 - 2 * u);
        const X = (u: number) => x0 + (x1 - x0) * u;
        const Y = (u: number) =>
          baseY + bob +
          (focusY - baseY) * 0.26 * ease(u) +
          Math.sin(u * d.freq * Math.PI * 2 - t * d.speed * 1.6 + d.phase) * unit * 0.3 * d.amp * u +
          d.tilt * unit * u;
        // Droplet profile: fat head, a neck that thins out fast, then a fine tail.
        const TH = (u: number) => R * 0.8 * Math.exp(-u * 12) + R * 0.24 * (1 - u * 0.7) + 1.2;

        const stroke = (a: number, b: number, step = 0.012) => {
          for (let u = a; u < b; u += step) {
            const v = Math.min(u + step, b);
            ctx.lineWidth = TH((u + v) / 2) * 2;
            ctx.beginPath();
            ctx.moveTo(X(u), Y(u));
            ctx.lineTo(X(v), Y(v));
            ctx.stroke();
          }
        };
        const knob = (u: number, k = 1.25) => {
          ctx.beginPath();
          ctx.arc(X(u), Y(u), TH(u) * k, 0, Math.PI * 2);
          ctx.fill();
        };

        // Neck + continuous tail, ending on a small bulb
        stroke(0, d.breakAt);
        knob(d.breakAt, 1.9);

        // Dashes in a log space so they shrink towards the end and loop seamlessly.
        const span = 1 - d.breakAt;
        const toU = (vv: number) => d.breakAt + span * (1 - Math.exp(-vv));
        const P = d.period;
        const offset = ((t * d.speed * 0.45) % P + P) % P;
        for (let k = -1; k < 12; k++) {
          const va = k * P + offset + 0.12;
          const vb = va + P * 0.62;
          if (vb <= 0.04) continue;
          const ua = toU(Math.max(va, 0.04));
          const ub = toU(vb);
          if (ua > 0.985) break;
          stroke(ua, Math.min(ub, 0.99), 0.006);
          knob(ua, 1.8); knob(Math.min(ub, 0.99), 1.8);
        }

        // Glossy droplet head
        const hx = X(0) - R * 0.25, hy = Y(0);
        ctx.beginPath();
        ctx.ellipse(hx, hy, R * 1.15, R, 0, 0, Math.PI * 2);
        ctx.fill();
        const shine = ctx.createRadialGradient(hx - R * 0.4, hy - R * 0.45, 0, hx - R * 0.4, hy - R * 0.45, R * 0.75);
        shine.addColorStop(0, "rgba(255,255,255,0.55)");
        shine.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.ellipse(hx, hy, R * 1.12, R, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = grad;
      }
    };

    const loop = (time: number) => {
      draw(time);
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    resize();
    draw(performance.now());
    if (!reduce) restart();

    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce) restart();
    });
    io.observe(canvas);
    const onVis = () => { if (!document.hidden && visible && !reduce) restart(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [streams, seed, spread, headScale]);

  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden="true" />;
}
