"use client";
import { useRef, useEffect, useCallback } from "react";

interface Props {
  /** muted dot color, e.g. "#7A7368" */
  baseColor: string;
  /** accent color for hover glow, e.g. "#EFD000" */
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
    const gap = 35;
    const baseR = 1.5;
    const radius = 100;
    const [br, bg, bb] = parseHex(baseColor);
    const [ar, ag, ab] = parseHex(accentColor);

    ctx.clearRect(0, 0, w, h);

    for (let x = gap; x < w; x += gap) {
      for (let y = gap; y < h; y += gap) {
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t = Math.max(0, 1 - dist / radius); // 1 at cursor, 0 at edge

        const opacity = 0.15 + t * 0.45;
        const scale = 1 + t * 2;
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
      const rect = c.parentElement!.getBoundingClientRect();
      c.width = rect.width;
      c.height = rect.height;
    };

    const onMove = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    resize();
    window.addEventListener("resize", resize);
    c.addEventListener("mousemove", onMove);
    c.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      c.removeEventListener("mousemove", onMove);
      c.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={cvs}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "auto",
      }}
    />
  );
}
