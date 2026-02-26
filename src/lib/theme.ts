// Theme colors - matches your existing P() function
export const getColors = (dark: boolean) => ({
  bg: dark ? "#0B0B0D" : "#F6F4EE",
  card: dark ? "#151517" : "#FFFFFF",
  cardH: dark ? "#1C1C20" : "#FDFCF9",
  fg: dark ? "#ECE8E0" : "#15130F",
  fgS: dark ? "#ADA69C" : "#6A645C",
  mt: dark ? "#7A7368" : "#9C968E",
  mtBg: dark ? "#1C1C20" : "#EBE7DF",
  bd: dark ? "#282622" : "#DDD9CF",
  bdH: dark ? "#383530" : "#C8C4BA",
  ac: dark ? "#EFD000" : "#C9A200",
  acS: dark ? "#EFD00018" : "#C9A20012",
  acM: dark ? "#EFD00030" : "#C9A20025",
  acF: "#15130F",
  gn: dark ? "#6EE7A0" : "#15803D",
  gnS: dark ? "#6EE7A015" : "#15803D10",
  rd: dark ? "#FCA5A5" : "#B91C1C",
  rdS: dark ? "#FCA5A515" : "#B91C1C10",
  bl: dark ? "#93C5FD" : "#1D4ED8",
  blS: dark ? "#93C5FD12" : "#1D4ED808",
  pr: "#7C3AED",
  prS: dark ? "#7C3AED20" : "#7C3AED10",
  sh: dark
    ? "0 1px 3px rgba(0,0,0,.4)"
    : "0 1px 3px rgba(0,0,0,.03),0 1px 2px rgba(0,0,0,.06)",
  shM: dark
    ? "0 4px 14px rgba(0,0,0,.5)"
    : "0 4px 20px rgba(0,0,0,.05),0 1px 3px rgba(0,0,0,.07)",
  shL: dark
    ? "0 14px 44px rgba(0,0,0,.6)"
    : "0 14px 44px rgba(0,0,0,.07),0 4px 14px rgba(0,0,0,.04)",
  shH: dark
    ? "0 8px 32px rgba(0,0,0,.55)"
    : "0 8px 32px rgba(0,0,0,.09),0 2px 8px rgba(0,0,0,.05)",
  gl: dark ? "rgba(11,11,13,.85)" : "rgba(246,244,238,.78)",
});

export const fonts = {
  d: "'Instrument Serif', Georgia, serif",
  b: "'Outfit', 'Helvetica Neue', sans-serif",
  m: "'JetBrains Mono', 'Fira Code', monospace",
};

export const SECTIONS = [
  "Inference",
  "Deduction",
  "Assumptions",
  "Interpretation",
  "Arguments",
] as const;

export type Section = (typeof SECTIONS)[number];