"use client";
import { useState, ReactNode, CSSProperties } from "react";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";

// ============================================================================
// BUTTON
// ============================================================================
type BtnVariant = "primary" | "outline" | "ghost" | "destructive" | "green";
type BtnSize = "sm" | "md" | "lg";

export function Btn({
  children,
  onClick,
  v = "primary",
  sz = "md",
  disabled,
  full,
  style: st = {},
}: {
  children: ReactNode;
  onClick?: () => void;
  v?: BtnVariant;
  sz?: BtnSize;
  disabled?: boolean;
  full?: boolean;
  style?: CSSProperties;
}) {
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const [h, sH] = useState(false);

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: fonts.b,
    fontWeight: 600,
    borderRadius: 10,
    transition: "all .28s cubic-bezier(.4,0,.2,1)",
    opacity: disabled ? 0.35 : 1,
    width: full ? "100%" : "auto",
    fontSize: sz === "lg" ? 15 : sz === "sm" ? 12.5 : 14,
    padding: sz === "lg" ? "14px 30px" : sz === "sm" ? "7px 14px" : "10px 20px",
    letterSpacing: 0.3,
    transform: h && !disabled ? "translateY(-2px)" : "translateY(0)",
  };

  const variants: Record<BtnVariant, CSSProperties> = {
    primary: {
      background: c.ac,
      color: c.acF,
      boxShadow: h ? `0 6px 24px ${c.ac}45` : `0 2px 10px ${c.ac}25`,
    },
    outline: {
      background: h ? c.mtBg : "transparent",
      color: c.fg,
      border: `1.5px solid ${h ? c.bdH : c.bd}`,
      boxShadow: h ? c.shM : "none",
    },
    ghost: {
      background: h ? c.mtBg : "transparent",
      color: c.fgS,
    },
    destructive: {
      background: c.rd,
      color: "#fff",
      boxShadow: h ? `0 4px 18px ${c.rd}40` : "none",
    },
    green: {
      background: c.gn,
      color: "#fff",
      boxShadow: h ? `0 6px 24px ${c.gn}40` : `0 2px 10px ${c.gn}20`,
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[v], ...st }}
      onMouseEnter={() => sH(true)}
      onMouseLeave={() => sH(false)}
    >
      {children}
    </button>
  );
}

// ============================================================================
// CARD
// ============================================================================
export function Card({
  children,
  style: st = {},
  accent,
  hover: hv,
  className = "",
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  accent?: boolean;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  const [h, sH] = useState(false);

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hv && sH(true)}
      onMouseLeave={() => hv && sH(false)}
      style={{
        background: h ? c.cardH : c.card,
        border: accent ? `1.5px solid ${c.ac}35` : `1px solid ${c.bd}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: h ? c.shH : c.sh,
        transition: "all .32s cubic-bezier(.4,0,.2,1)",
        transform: h ? "translateY(-4px)" : "translateY(0)",
        cursor: onClick ? "pointer" : "default",
        ...st,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================
export function PB({
  value,
  color,
  height = 6,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  return (
    <div
      style={{
        width: "100%",
        height,
        background: c.mtBg,
        borderRadius: height / 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          background: color || `linear-gradient(90deg,${c.ac},${c.ac}CC)`,
          borderRadius: height / 2,
          transition: "width .8s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

// ============================================================================
// CONTAINER
// ============================================================================
export function Ctn({
  children,
  style = {},
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", ...style }}>
      {children}
    </div>
  );
}

// ============================================================================
// MONO TEXT
// ============================================================================
export function Mono({
  children,
  style = {},
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return <span style={{ fontFamily: fonts.m, ...style }}>{children}</span>;
}

// ============================================================================
// ICON BOX
// ============================================================================
export function IB({
  children,
  bg,
  size = 48,
}: {
  children: ReactNode;
  bg: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// CONFIRM MODAL
// ============================================================================
export function ConfirmModal({
  open,
  title,
  body,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: BtnVariant;
}) {
  const { theme } = useTheme();
  const c = getColors(theme === "dark");
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        animation: "fi .2s",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 400,
          width: "90%",
          padding: "32px 28px",
          borderRadius: 20,
          background: c.card,
          border: "1px solid " + c.bd,
          textAlign: "center",
          animation: "sd .3s ease-out",
          boxShadow: c.shL,
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: "-.02em",
          }}
        >
          {title}
        </h3>
        <p style={{ color: c.fgS, fontSize: 14, marginBottom: 24, lineHeight: 1.65 }}>
          {body}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn v="outline" full onClick={onCancel}>
            {cancelText || "Cancel"}
          </Btn>
          <Btn v={variant || "destructive"} full onClick={onConfirm}>
            {confirmText || "Confirm"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// THEME TOGGLE
// ============================================================================
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const c = getColors(theme === "dark");
  const [h, sH] = useState(false);

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => sH(true)}
      onMouseLeave={() => sH(false)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: `1px solid ${c.bd}`,
        background: h ? c.mtBg : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .2s",
        color: c.fgS,
      }}
    >
      {theme === "light" ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
}

// ============================================================================
// HEADER
// ============================================================================
export function Hdr({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  return (
    <div
      style={{
        borderBottom: `1px solid ${c.bd}`,
        background: c.gl,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Ctn style={{ padding: "13px 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {left}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {right}
          </div>
        </div>
      </Ctn>
    </div>
  );
}

// ============================================================================
// LOGO
// ============================================================================
export function Logo({ onClick }: { onClick?: () => void }) {
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  return (
    <div
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          background: c.ac,
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: fonts.m,
            fontWeight: 700,
            fontSize: 15,
            color: c.acF,
          }}
        >
          ∴
        </span>
      </div>
      <span
        style={{
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: "-.02em",
          color: c.fg,
        }}
      >
        Ergo
      </span>
    </div>
  );
}

// ============================================================================
// FOOTER
// ============================================================================
export function Ftr() {
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  const links = [
    { label: "About Us", href: "/about" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ];

  return (
    <div style={{ borderTop: `1px solid ${c.bd}`, padding: "44px 0", marginTop: 60 }}>
      <Ctn>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                background: c.ac,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: fonts.m,
                  fontWeight: 700,
                  fontSize: 11,
                  color: c.acF,
                }}
              >
                ∴
              </span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 13, color: c.mt }}>Ergo</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {links.map((p) => (
              <a
                key={p.label}
                href={p.href}
                style={{
                  fontSize: 12.5,
                  color: c.mt,
                  cursor: "pointer",
                  transition: "color .2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = c.fg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = c.mt;
                }}
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </Ctn>
    </div>
  );
}

// ============================================================================
// SVG ICONS
// ============================================================================
export const Icons = {
  trend: (c: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  clock: (c: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  target: (c: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  book: (c: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  check: (c: string) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  x: (c: string) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  arr: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  logout: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  zap: (c: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" />
    </svg>
  ),
  bar: (c: string) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  user: (c: string) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};
