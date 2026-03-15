"use client";
import { useRef, useEffect, useCallback } from "react";

interface Props {
  baseColor: string;
  accentColor: string;
}

export default function DotGrid({ baseColor, accentColor }: Props) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);

  const parseHex = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };

  const draw = useCallback(() => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const w = c.width;
    const h = c.height;
    const mx = mouse.current.x;
    const my = mouse.current.y;
    const gap = 40;
    const baseR = 1.5;
    const radius = 190;
    const radiusSq = radius * radius;
    const [br, bg, bb] = parseHex(baseColor);
    const [ar, ag, ab] = parseHex(accentColor);
    const baseFill = `rgba(${br},${bg},${bb},0.15)`;

    ctx.clearRect(0, 0, w, h);

    const active = mx > -1000 && my > -1000;
    // Bounding box for quick column/row skip (circular check inside)
    const nearR = radius + gap;

    for (let x = gap; x < w; x += gap) {
      const colFar = active && (x < mx - nearR || x > mx + nearR);

      for (let y = gap; y < h; y += gap) {
        // Quick bounding-box reject, then true circular distance
        if (colFar || (active && (y < my - nearR || y > my + nearR))) {
          ctx.beginPath();
          ctx.arc(x, y, baseR, 0, Math.PI * 2);
          ctx.fillStyle = baseFill;
          ctx.fill();
          continue;
        }

        const dx = x - mx;
        const dy = y - my;
        const distSq = dx * dx + dy * dy;

        if (!active || distSq > radiusSq) {
          ctx.beginPath();
          ctx.arc(x, y, baseR, 0, Math.PI * 2);
          ctx.fillStyle = baseFill;
          ctx.fill();
          continue;
        }

        const dist = Math.sqrt(distSq);
        const t = 1 - dist / radius; // 0..1, smooth falloff

        const opacity = 0.15 + t * 0.7;
        const scale = 1 + t * 5;
        const r = Math.round(br + (ar - br) * t);
        const g = Math.round(bg + (ag - bg) * t);
        const b = Math.round(bb + (ab - bb) * t);

        ctx.beginPath();
        ctx.arc(x, y, baseR * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
      }
    }

    raf.current = requestAnimationFrame(draw);
  }, [baseColor, accentColor]);

  useEffect(() => {
    const c = cvs.current;
    if (!c) return;

    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
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
