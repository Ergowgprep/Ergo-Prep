"use client";
import { useRef, useEffect } from "react";

interface Dot {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Props {
  baseColor: string;
  accentColor?: string;
}

const GAP = 21;
const DOT_R = 0.65;
const BASE_OPACITY = 0.13;
const JITTER = 4; // ±px random offset
const RADIUS = 170;
const RADIUS_SQ = RADIUS * RADIUS;
const MAX_PUSH = 18;
const SPRING = 0.045;
const DAMPING = 0.84;

function buildDots(w: number, h: number): Dot[] {
  const dots: Dot[] = [];
  for (let gx = GAP; gx < w; gx += GAP) {
    for (let gy = GAP; gy < h; gy += GAP) {
      const hx = gx + (Math.random() * 2 - 1) * JITTER;
      const hy = gy + (Math.random() * 2 - 1) * JITTER;
      dots.push({ homeX: hx, homeY: hy, x: hx, y: hy, vx: 0, vy: 0 });
    }
  }
  return dots;
}

function parseHex(hex: string) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export default function DotGrid({ baseColor }: Props) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const dots = useRef<Dot[]>([]);
  const raf = useRef(0);

  useEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      dots.current = buildDots(c.width, c.height);
    };

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    resize();

    const [cr, cg, cb] = parseHex(baseColor);
    const fill = `rgba(${cr},${cg},${cb},${BASE_OPACITY})`;

    const tick = () => {
      const w = c.width;
      const h = c.height;
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const active = mx > -1000 && my > -1000;
      const arr = dots.current;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = fill;

      for (let i = 0, len = arr.length; i < len; i++) {
        const d = arr[i];

        // Spring toward home
        const shx = (d.homeX - d.x) * SPRING;
        const shy = (d.homeY - d.y) * SPRING;
        d.vx += shx;
        d.vy += shy;

        // Repulsion from cursor
        if (active) {
          const dx = d.homeX - mx;
          const dy = d.homeY - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < RADIUS_SQ && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const t = 1 - dist / RADIUS; // 1 at cursor, 0 at edge
            const push = t * MAX_PUSH * 0.15; // force magnitude
            d.vx += (dx / dist) * push;
            d.vy += (dy / dist) * push;
          }
        }

        // Damping
        d.vx *= DAMPING;
        d.vy *= DAMPING;

        // Integrate
        d.x += d.vx;
        d.y += d.vy;

        // Draw
        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2);
        ctx.fill();
      }

      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [baseColor]);

  return (
    <canvas
      ref={cvs}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
