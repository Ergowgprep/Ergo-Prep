"use client";
import { useRef, useEffect, useCallback } from "react";

interface Props {
  baseColor: string;
  accentColor: string;
}

interface Dot {
  homeX: number;
  homeY: number;
  currentX: number;
  currentY: number;
  vx: number;
  vy: number;
}

const GAP = 21;
const DOT_RADIUS = 0.65;
const BASE_OPACITY = 0.13;
const RANDOM_OFFSET = 4; // ±4px
const CURSOR_RADIUS = 165;
const MAX_DISPLACEMENT = 18;
const DAMPING = 0.85;
const SPRING = 0.05;
const REPULSION_STRENGTH = 800;

function parseHex(hex: string) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildDots(w: number, h: number): Dot[] {
  const dots: Dot[] = [];
  const rng = seededRandom(42);
  for (let x = GAP; x < w; x += GAP) {
    for (let y = GAP; y < h; y += GAP) {
      const ox = (rng() - 0.5) * 2 * RANDOM_OFFSET;
      const oy = (rng() - 0.5) * 2 * RANDOM_OFFSET;
      const hx = x + ox;
      const hy = y + oy;
      dots.push({ homeX: hx, homeY: hy, currentX: hx, currentY: hy, vx: 0, vy: 0 });
    }
  }
  return dots;
}

export default function DotGrid({ baseColor }: Props) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);
  const dots = useRef<Dot[]>([]);

  const draw = useCallback(() => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const w = c.width;
    const h = c.height;
    const mx = mouse.current.x;
    const my = mouse.current.y;
    const [br, bg, bb] = parseHex(baseColor);
    const fill = `rgba(${br},${bg},${bb},${BASE_OPACITY})`;
    const cursorActive = mx > -1000 && my > -1000;
    const radiusSq = CURSOR_RADIUS * CURSOR_RADIUS;

    // Physics step
    const arr = dots.current;
    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];

      // Repulsion from cursor
      if (cursorActive) {
        const dx = d.currentX - mx;
        const dy = d.currentY - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < radiusSq && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = REPULSION_STRENGTH / (distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          d.vx += nx * force;
          d.vy += ny * force;
        }
      }

      // Spring toward home
      d.vx += (d.homeX - d.currentX) * SPRING;
      d.vy += (d.homeY - d.currentY) * SPRING;

      // Damping
      d.vx *= DAMPING;
      d.vy *= DAMPING;

      // Integrate
      d.currentX += d.vx;
      d.currentY += d.vy;

      // Clamp displacement
      const ddx = d.currentX - d.homeX;
      const ddy = d.currentY - d.homeY;
      const disp = Math.sqrt(ddx * ddx + ddy * ddy);
      if (disp > MAX_DISPLACEMENT) {
        const scale = MAX_DISPLACEMENT / disp;
        d.currentX = d.homeX + ddx * scale;
        d.currentY = d.homeY + ddy * scale;
      }
    }

    // Render
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      ctx.moveTo(d.currentX + DOT_RADIUS, d.currentY);
      ctx.arc(d.currentX, d.currentY, DOT_RADIUS, 0, Math.PI * 2);
    }
    ctx.fill();

    raf.current = requestAnimationFrame(draw);
  }, [baseColor]);

  useEffect(() => {
    const c = cvs.current;
    if (!c) return;

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
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [draw]);

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
