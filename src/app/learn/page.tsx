"use client";
import type { JSX } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getColors, fonts, SECTIONS } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import {
  Btn, Card, Ctn, Mono, Hdr, PB, ThemeToggle, Icons, ConfirmModal,
} from "@/components/ui";
import { BookOpen, Brain, Search, GitBranch, Puzzle, Scale, MessageCircle, Blocks } from "lucide-react";

type SecKey = "Ergo Fundamentals" | "Logic Essentials" | "Inference" | "Assumptions" | "Deduction" | "Interpretation" | "Arguments";

const LEARN_SECTIONS: SecKey[] = ["Ergo Fundamentals", "Logic Essentials", ...SECTIONS] as SecKey[];

const secIcons: Record<SecKey, JSX.Element> = {
  "Ergo Fundamentals": <Blocks size={22} />,
  "Logic Essentials": <Brain size={22} />,
  Inference: <Search size={22} />,
  Assumptions: <Puzzle size={22} />,
  Deduction: <GitBranch size={22} />,
  Interpretation: <Scale size={22} />,
  Arguments: <MessageCircle size={22} />,
};

const secInfo: Record<SecKey, { icon: JSX.Element; color: string; desc: string; ready: boolean }> = {
  "Ergo Fundamentals": { icon: secIcons["Ergo Fundamentals"], color: "#F97316", desc: "Understand the three building blocks — Premises, Assumptions, and Conclusions — that every Watson-Glaser question is built from before tackling the five sections.", ready: true },
  "Logic Essentials": { icon: secIcons["Logic Essentials"], color: "#0EA5E9", desc: "The rigid rules of quantifiers and connectors. The foundational 'math of words' required for Deduction and Interpretation.", ready: true },
  Inference: { icon: secIcons.Inference, color: "#6366F1", desc: "Evaluate whether evidence supports, contradicts, or is insufficient for a given conclusion.", ready: true },
  Assumptions: { icon: secIcons.Assumptions, color: "#EC4899", desc: "Identify hidden assumptions that must be true for an argument to hold.", ready: true },
  Deduction: { icon: secIcons.Deduction, color: "#F59E0B", desc: "Determine whether conclusions necessarily follow from the given statements.", ready: true },
  Interpretation: { icon: secIcons.Interpretation, color: "#10B981", desc: "Assess whether conclusions follow beyond a reasonable doubt from the data presented.", ready: true },
  Arguments: { icon: secIcons.Arguments, color: "#3B82F6", desc: "Distinguish strong, relevant arguments from weak or irrelevant ones.", ready: true },
};

export default function LearnPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  const [sel, setSel] = useState<SecKey | null>(null);
  const [started, setStarted] = useState(false);
  const [slide, setSlide] = useState(0);
  const [ans, setAns] = useState<Record<string, any>>({});
  const [showExp, setSE] = useState(false);
  const [, setSI] = useState(false);
  const [exitConfirm, setEC] = useState(false);

  // TODO: Replace with real state from Supabase
  const { profile } = useAuth();
  const hasAcc = !!(
    profile?.promo_code ||
    (profile?.access_expires_at && new Date(profile.access_expires_at) > new Date())
  );

  const ac = secInfo.Arguments.color;
  const lc = secInfo["Logic Essentials"].color;
  const fc = secInfo["Ergo Fundamentals"].color;

  // ============================================================================
  // INTERACTIVE COMPONENTS
  // ============================================================================

  const MCQ = ({
    qKey, question, subtitle, opts, correctArr, expText, multi,
  }: {
    qKey: string; question: string; subtitle?: string; opts: string[];
    correctArr: number[]; expText: string; multi?: boolean;
  }) => {
    const submitted = showExp;
    const toggle = (i: number) => {
      if (submitted) return;
      if (multi) {
        setAns((p) => {
          const cur = p[qKey] || [];
          return { ...p, [qKey]: cur.includes(i) ? cur.filter((x: number) => x !== i) : [...cur, i] };
        });
      } else {
        setAns((p) => ({ ...p, [qKey]: i }));
      }
    };
    const pickedArr: number[] = multi ? (ans[qKey] || []) : [ans[qKey]];
    const isRight = multi
      ? (pickedArr.length === correctArr.length && correctArr.every((i) => pickedArr.includes(i)))
      : (ans[qKey] === correctArr[0]);
    const hasAnswer = multi ? pickedArr.length > 0 : (ans[qKey] != null && ans[qKey] >= 0);
    const acColor = sel === "Logic Essentials" ? lc : sel === "Ergo Fundamentals" ? fc : ac;

    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{question}</h2>
        {subtitle && <p style={{ fontSize: 14, color: c.fgS, marginBottom: 14, lineHeight: 1.7 }}>{subtitle}</p>}
        {multi && <p style={{ fontSize: 13, color: c.mt, marginBottom: 12 }}>Select all that apply.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {opts.map((o, i) => {
            const isSel = multi ? pickedArr.includes(i) : ans[qKey] === i;
            const isC = correctArr.includes(i);
            let bg = "transparent", bd = c.bd;
            if (submitted) {
              if (isC) { bg = c.gn + "18"; bd = c.gn; }
              else if (isSel && !isC) { bg = c.rd + "18"; bd = c.rd; }
            } else if (isSel) { bg = acColor + "12"; bd = acColor; }
            return (
              <button key={i} onClick={() => toggle(i)} style={{
                padding: "11px 15px", background: bg, border: "1.5px solid " + bd, borderRadius: 10,
                textAlign: "left", fontSize: 13.5, fontWeight: 500, color: c.fg, transition: "all .2s",
                cursor: "pointer", fontFamily: fonts.b, lineHeight: 1.55, display: "flex", alignItems: "center", gap: 10,
              }}>
                {multi && (
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, border: "2px solid " + (isSel ? acColor : c.bd),
                    background: isSel ? acColor : "transparent", display: "flex", alignItems: "center",
                    justifyContent: "center", transition: "all .2s", flexShrink: 0,
                  }}>
                    {isSel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                  </div>
                )}
                {!multi && <Mono style={{ fontSize: 11, color: c.mt, fontWeight: 600, width: 16, flexShrink: 0 }}>{String.fromCharCode(65 + i)}</Mono>}
                <span style={{ flex: 1 }}>{o}</span>
                {submitted && isC && <span style={{ flexShrink: 0 }}>{Icons.check(c.gn)}</span>}
                {submitted && isSel && !isC && <span style={{ flexShrink: 0 }}>{Icons.x(c.rd)}</span>}
              </button>
            );
          })}
        </div>
        {!submitted && (
          <button onClick={() => { if (hasAnswer) setSE(true); }} style={{
            width: "100%", marginTop: 14, padding: "12px 20px",
            background: hasAnswer ? acColor : c.bd, color: hasAnswer ? "#fff" : c.mt,
            borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
            fontFamily: fonts.b, transition: "all .2s",
          }}>Check Answer</button>
        )}
        {submitted && (
          <div style={{
            marginTop: 14, padding: 14, background: isRight ? c.gn + "0C" : c.rd + "0C",
            border: "1px solid " + (isRight ? c.gn + "33" : c.rd + "33"), borderRadius: 10, animation: "fu .3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              {isRight ? Icons.check(c.gn) : Icons.x(c.rd)}
              <span style={{ fontWeight: 700, fontSize: 13, color: isRight ? c.gn : c.rd }}>{isRight ? "Correct!" : "Not quite"}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: c.fgS }}>{expText}</p>
          </div>
        )}
      </div>
    );
  };

  const TF = ({
    qKey, scenario, question, correct, expText,
  }: {
    qKey: string; scenario: string; question: string; correct: boolean; expText: string;
  }) => {
    const picked = ans[qKey];
    const submitted = showExp;
    const isCorrect = picked === correct;
    return (
      <div>
        {scenario && (
          <div style={{ padding: 16, background: c.mtBg, borderRadius: 12, border: "1px solid " + c.bd, marginBottom: 16 }}>
            <p style={{ fontSize: 14, lineHeight: 1.7, fontStyle: "italic", color: c.fgS }}>{scenario}</p>
          </div>
        )}
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>{question}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[true, false].map((v) => {
            let bg = "transparent", bd = c.bd;
            if (submitted) {
              if (v === correct) { bg = c.gn + "18"; bd = c.gn; }
              else if (v === picked) { bg = c.rd + "18"; bd = c.rd; }
            } else if (v === picked) { bg = lc + "12"; bd = lc; }
            return (
              <button key={String(v)} onClick={() => { if (!submitted) setAns((p) => ({ ...p, [qKey]: v })); }} style={{
                padding: "14px 18px", background: bg, border: "1.5px solid " + bd, borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: fonts.b, color: c.fg, transition: "all .2s",
              }}>{v ? "True" : "False"}</button>
            );
          })}
        </div>
        {!submitted && picked != null && (
          <button onClick={() => setSE(true)} style={{
            width: "100%", marginTop: 14, padding: "12px 20px", background: lc, color: "#fff",
            borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: fonts.b,
          }}>Check Answer</button>
        )}
        {submitted && (
          <div style={{
            marginTop: 14, padding: 14, background: isCorrect ? c.gn + "0C" : c.rd + "0C",
            border: "1px solid " + (isCorrect ? c.gn + "33" : c.rd + "33"), borderRadius: 10, animation: "fu .3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              {isCorrect ? Icons.check(c.gn) : Icons.x(c.rd)}
              <span style={{ fontWeight: 700, fontSize: 13, color: isCorrect ? c.gn : c.rd }}>{isCorrect ? "Correct!" : "The answer is " + (correct ? "True" : "False")}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: c.fgS }}>{expText}</p>
          </div>
        )}
      </div>
    );
  };

  const ClickID = ({
    qKey, label, segments, correctIdx, expText,
  }: {
    qKey: string; label?: string; segments: string[]; correctIdx: number; expText: string;
  }) => {
    const picked = ans[qKey];
    const submitted = showExp;
    return (
      <div>
        <p style={{ fontSize: 14, color: c.fgS, marginBottom: 14, lineHeight: 1.7 }}>{label || "Click the correct part of the statement."}</p>
        <div style={{ padding: 20, background: c.mtBg, borderRadius: 12, border: "1px solid " + c.bd, marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {segments.map((seg, i) => {
            let bg = "transparent", bd = "transparent", col = c.fg;
            if (submitted) {
              if (i === correctIdx) { bg = c.gn + "18"; bd = c.gn; col = c.gn; }
              else if (i === picked && i !== correctIdx) { bg = c.rd + "18"; bd = c.rd; col = c.rd; }
            } else if (i === picked) { bg = lc + "15"; bd = lc; col = lc; }
            return (
              <button key={i} onClick={() => { if (!submitted) setAns((p) => ({ ...p, [qKey]: i })); }} style={{
                padding: "6px 12px", background: bg, border: "1.5px solid " + bd, borderRadius: 8,
                fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: fonts.b, color: col, transition: "all .2s",
              }}>{seg}</button>
            );
          })}
        </div>
        {!submitted && picked != null && (
          <button onClick={() => setSE(true)} style={{
            width: "100%", marginTop: 6, padding: "12px 20px", background: lc, color: "#fff",
            borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: fonts.b,
          }}>Check Answer</button>
        )}
        {submitted && (
          <div style={{
            marginTop: 10, padding: 14, background: picked === correctIdx ? c.gn + "0C" : c.rd + "0C",
            border: "1px solid " + (picked === correctIdx ? c.gn + "33" : c.rd + "33"), borderRadius: 10, animation: "fu .3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              {picked === correctIdx ? Icons.check(c.gn) : Icons.x(c.rd)}
              <span style={{ fontWeight: 700, fontSize: 13, color: picked === correctIdx ? c.gn : c.rd }}>{picked === correctIdx ? "Correct!" : "Not quite"}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: c.fgS }}>{expText}</p>
          </div>
        )}
      </div>
    );
  };

  const DragRank = ({
    qKey, title, subtitle, items, correctOrder, expText,
  }: {
    qKey: string; title: string; subtitle?: string; items: string[]; correctOrder: string[]; expText: string;
  }) => {
    const picked: string[] = ans[qKey] || items;
    const submitted = showExp;
    const isCorrect = JSON.stringify(picked) === JSON.stringify(correctOrder);
    const [dragIdx, setDI] = useState<number | null>(null);
    const [overIdx, setOI] = useState<number | null>(null);

    if (!ans[qKey]) setAns((p) => ({ ...p, [qKey]: [...items] }));

    const drop = (to: number) => {
      if (submitted || dragIdx === null || dragIdx === to) return;
      const a = [...picked];
      const [el] = a.splice(dragIdx, 1);
      a.splice(to, 0, el);
      setAns((p) => ({ ...p, [qKey]: a }));
      setDI(null);
      setOI(null);
    };
    const move = (from: number, to: number) => {
      if (submitted || to < 0 || to >= picked.length) return;
      const a = [...picked];
      const [el] = a.splice(from, 1);
      a.splice(to, 0, el);
      setAns((p) => ({ ...p, [qKey]: a }));
    };

    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 14, color: c.fgS, marginBottom: 16, lineHeight: 1.7 }}>{subtitle}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {picked.map((item, i) => {
            let bg = c.card, bd = c.bd;
            if (submitted) {
              if (item === correctOrder[i]) { bg = c.gn + "18"; bd = c.gn; }
              else { bg = c.rd + "18"; bd = c.rd; }
            } else if (overIdx === i && dragIdx !== i) { bd = lc; }
            return (
              <div key={item} draggable={!submitted}
                onDragStart={() => setDI(i)} onDragEnd={() => { setDI(null); setOI(null); }}
                onDragOver={(e) => { e.preventDefault(); setOI(i); }} onDrop={() => drop(i)}
                style={{
                  padding: "12px 16px", background: bg, border: "1.5px solid " + bd, borderRadius: 10,
                  display: "flex", alignItems: "center", gap: 12, transition: "all .2s",
                  cursor: submitted ? "default" : "grab", opacity: dragIdx === i ? 0.5 : 1,
                  transform: overIdx === i && dragIdx !== i && !submitted ? "scale(1.02)" : "scale(1)",
                }}>
                <Mono style={{ fontSize: 11, fontWeight: 700, color: c.mt, width: 18 }}>{i + 1}.</Mono>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.mt} strokeWidth="2" style={{ flexShrink: 0 }}>
                  <line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="16" x2="20" y2="16" />
                </svg>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item}</span>
                {!submitted && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {i > 0 && <button onClick={() => move(i, i - 1)} style={{ border: "none", background: "none", cursor: "pointer", color: c.mt, fontSize: 16, lineHeight: 1, padding: 0, fontFamily: fonts.m }}>▲</button>}
                    {i < picked.length - 1 && <button onClick={() => move(i, i + 1)} style={{ border: "none", background: "none", cursor: "pointer", color: c.mt, fontSize: 16, lineHeight: 1, padding: 0, fontFamily: fonts.m }}>▼</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!submitted && (
          <button onClick={() => setSE(true)} style={{
            width: "100%", marginTop: 14, padding: "12px 20px", background: lc, color: "#fff",
            borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: fonts.b,
          }}>Check Order</button>
        )}
        {submitted && (
          <div style={{
            marginTop: 14, padding: 14, background: isCorrect ? c.gn + "0C" : c.rd + "0C",
            border: "1px solid " + (isCorrect ? c.gn + "33" : c.rd + "33"), borderRadius: 10, animation: "fu .3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              {isCorrect ? Icons.check(c.gn) : Icons.x(c.rd)}
              <span style={{ fontWeight: 700, fontSize: 13, color: isCorrect ? c.gn : c.rd }}>{isCorrect ? "Correct!" : "Not quite"}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: c.fgS }}>{expText}</p>
            {!isCorrect && <p style={{ fontSize: 12.5, color: c.mt, marginTop: 6 }}>Correct order: {correctOrder.join(" < ")}</p>}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // FALLACIES DATA
  // ============================================================================
  const fallacies = [
    { prompt: "Should universities require students to attend all lectures?", arg: "Yes; university tuition fees have increased significantly over the past decade, placing a heavy financial burden on students and their families.", opts: ["Red Herring", "Slogan", "Slippery Slope", "Circular Argument", "Appeal", "Correlation not Causation", "Anecdote"], correct: 0, name: "Red Herring", exp: "The argument shifts from whether mandatory attendance improves learning to the unrelated topic of tuition costs. The cost of tuition has nothing to do with whether attending lectures is beneficial.\n\n💡 Pro Tip: A red herring sounds convincing because the fact itself may be true — but it answers a different question than the one being asked." },
    { prompt: "Should the legal voting age be lowered to 16?", arg: "Yes; because the youth are our future and we must always invest in our future.", opts: ["Red Herring", "Slogan", "Slippery Slope", "Circular Argument", "Appeal", "Correlation not Causation", "Anecdote"], correct: 1, name: "Slogan", exp: "It uses a catchy, inspirational phrase (\"the youth are our future\") to avoid discussing the actual logic of political maturity or civic responsibility.\n\n💡 Pro Tip: If you could print the argument on a motivational poster, it is probably a slogan, not a reasoned argument." },
    { prompt: "Is it a good idea for students to take a gap year before starting university?", arg: "Yes; many top universities admit loads of applicants who have taken gap years.", opts: ["Red Herring", "Slogan", "Slippery Slope", "Circular Argument", "Appeal", "Correlation not Causation", "Anecdote"], correct: 5, name: "Correlation not Causation", exp: "Just because top students happen to take gap years does not mean the gap year caused their success. A third factor (like motivation or resources) likely causes both.\n\n💡 Pro Tip: Ask \"Could there be a hidden third factor?\" If yes, the argument is confusing correlation with causation." },
    { prompt: "Should high schools allow students to use their phones during lunch breaks?", arg: "No; because if we allow them to use phones at lunch, they will soon demand to use them in class, eventually leading to a total collapse of discipline and the end of formal education.", opts: ["Red Herring", "Slogan", "Slippery Slope", "Circular Argument", "Appeal", "Correlation not Causation", "Anecdote"], correct: 2, name: "Slippery Slope", exp: "It takes a small step (phones at lunch) and predicts an extreme, unproven disaster (the end of education). Without a logical link proving this chain is inevitable, it is just fear-mongering.\n\n💡 Pro Tip: Look for a chain of \"this will lead to...\" without evidence connecting each step." },
    { prompt: "Should companies mandate a four-day work week to increase productivity?", arg: "Yes; because my cousin's design firm switched to four days and their profits doubled in just six months.", opts: ["Red Herring", "Slogan", "Slippery Slope", "Circular Argument", "Appeal", "Correlation not Causation", "Anecdote"], correct: 6, name: "Anecdote", exp: "A sample size of one is not a basis for national policy. What works for a specific design firm may not work for a hospital, a factory, or a law firm.\n\n💡 Pro Tip: Personal stories are emotionally compelling but statistically meaningless. One example proves nothing about a general rule." },
    { prompt: "Should all professional plumbers be required to hold a national certification?", arg: "Yes; because it is essential that the industry can ensure all its workers have the proper certification.", opts: ["Red Herring", "Slogan", "Slippery Slope", "Circular Argument", "Appeal", "Correlation not Causation", "Anecdote"], correct: 3, name: "Circular Argument", exp: "The argument says we need certification because we need people to be certified. It provides no external reason, such as safety standards or technical skill.\n\n💡 Pro Tip: If the conclusion just restates the premise in different words, the argument is circular. It goes nowhere." },
    { prompt: "Should the government increase taxes on luxury sports cars?", arg: "No; because it is simply mean-spirited to target people just because they have worked hard enough to afford a nice vehicle.", opts: ["Red Herring", "Slogan", "Slippery Slope", "Circular Argument", "Appeal", "Correlation not Causation", "Anecdote"], correct: 4, name: "Appeal", exp: "Words like \"mean-spirited\" appeal to emotion rather than objective impact. A strong argument would focus on economic factors, not the feelings of the car owners.\n\n💡 Pro Tip: If the argument makes you feel something instead of think something, it is likely an appeal to emotion." },
  ];

  // ============================================================================
  // ERGO FUNDAMENTALS SLIDES
  // ============================================================================
  const fundamentalsSlides = [
    // Slide 1/10 — Welcome (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 1 of 10</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Welcome to Ergo Fundamentals</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 16, background: fc + "0A", borderRadius: 12, border: "1px solid " + fc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: fc, marginBottom: 6 }}>The Goal</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>Before you learn the five Watson-Glaser sections, you need to understand the machine they all run on. Every question in the test is built from the same three components: <strong style={{ color: c.fg }}>Premises</strong>, <strong style={{ color: c.fg }}>Assumptions</strong>, and <strong style={{ color: c.fg }}>Conclusions</strong>.</p>
        </div>
        <div style={{ padding: 16, background: fc + "0A", borderRadius: 12, border: "1px solid " + fc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: fc, marginBottom: 6 }}>Why This Matters</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>Think of this section as the instruction manual. The five test sections are just <strong style={{ color: c.fg }}>five different ways of stress-testing the same machine</strong>.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Students who understand the underlying framework score higher because they know <em>what</em> they&apos;re being tested on — not just <em>how</em> to answer.</p>
      </div>
    </div> },

    // Slide 2/10 — The Three Building Blocks (Informative + Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 2 of 10</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Three Building Blocks</h2>
      <p style={{ fontSize: 14, color: c.fgS, lineHeight: 1.7, marginBottom: 14 }}>Every argument you will encounter in the Watson-Glaser test — no matter which section — is built from the same three components. If you can spot each one, you already know what the question is really asking.</p>
      <div style={{ padding: 12, background: fc + "0A", borderRadius: 10, border: "1px solid " + fc + "20", marginBottom: 14, textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>Premises + Assumptions → Conclusion</p>
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
        <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>Premise</h3>
          <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.6 }}>A stated fact or piece of evidence the author gives you. It&apos;s written in the passage — you can point to it.</p>
        </div>
        <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#EC4899", marginBottom: 4 }}>Assumption</h3>
          <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.6 }}>An unstated belief the author takes for granted. It&apos;s the hidden glue between what they say and what they conclude. You can&apos;t point to it — it lives in the gap.</p>
        </div>
        <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>Conclusion</h3>
          <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.6 }}>The endpoint the author arrives at. It&apos;s what they want you to accept based on their premises and assumptions.</p>
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: c.fg, marginBottom: 10 }}>Now let&apos;s see it in a real argument:</p>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> &ldquo;It has rained heavily all week. The river runs through a valley with no drainage system. Therefore, the valley will flood.&rdquo;</p>
      </div>
      <MCQ qKey="ef1" question="Which of these is the ASSUMPTION in this argument?" opts={["It has rained heavily all week", "Heavy rain with no drainage causes flooding", "The valley will flood"]} correctArr={[1]} expText={"The first statement is a Premise — it's a stated fact you can point to. The third is the Conclusion — it's what the author wants you to accept. The second is the Assumption — it's nowhere in the passage. The author jumps from \"rain + no drainage\" to \"flooding\" without explaining why that connection exists.\n\n💡 Pro Tip: Every Watson-Glaser question is testing whether you can see these invisible jumps."} />
    </div> },

    // Slide 3/10 — Try It Again (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 3 of 10 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Try It Again</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> &ldquo;The restaurant has received five consecutive hygiene violations. The council should shut it down immediately.&rdquo;</p>
      </div>
      <MCQ qKey="ef2" question="Which of these is the PREMISE (stated fact)?" opts={["The restaurant has received five consecutive hygiene violations", "Repeated hygiene violations make a restaurant unsafe to eat at", "The council should shut it down immediately"]} correctArr={[0]} expText={"The first statement is the Premise — it's a fact stated in the passage. The second is the Assumption — the author takes for granted that violations mean the restaurant is unsafe (maybe they were minor paperwork issues). The third is the Conclusion — the action the author wants.\n\n💡 Pro Tip: The assumption here is debatable — and that's exactly why the Watson-Glaser tests it. The author assumes you'll agree that violations mean danger."} />
    </div> },

    // Slide 4/10 — The Machine (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 4 of 10</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>The Machine</h2>
      <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        <div style={{ padding: 16, background: "#10B981" + "0A", borderRadius: 12, border: "1px solid #10B981" + "20", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>PREMISES</p>
          <p style={{ fontSize: 12, color: c.fgS }}>what you&apos;re told</p>
        </div>
        <div style={{ textAlign: "center", fontSize: 18, color: c.mt }}>+</div>
        <div style={{ padding: 16, background: "#EC4899" + "0A", borderRadius: 12, border: "1px solid #EC4899" + "20", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#EC4899" }}>ASSUMPTIONS</p>
          <p style={{ fontSize: 12, color: c.fgS }}>what&apos;s hidden</p>
        </div>
        <div style={{ textAlign: "center", fontSize: 18, color: c.mt }}>↓</div>
        <div style={{ padding: 16, background: "#F59E0B" + "0A", borderRadius: 12, border: "1px solid #F59E0B" + "20", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>CONCLUSION</p>
          <p style={{ fontSize: 12, color: c.fgS }}>what&apos;s claimed</p>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ padding: 12, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd }}>
          <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.6 }}><strong style={{ color: c.fg }}>If the premises are weak</strong> → the conclusion is unreliable</p>
        </div>
        <div style={{ padding: 12, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd }}>
          <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.6 }}><strong style={{ color: c.fg }}>If the assumption is wrong</strong> → the conclusion collapses</p>
        </div>
        <div style={{ padding: 12, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd }}>
          <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.6 }}><strong style={{ color: c.fg }}>If the conclusion goes beyond what the premises + assumptions support</strong> → it doesn&apos;t follow</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> The Watson-Glaser test is just five different ways of poking this machine to see if it breaks.</p>
      </div>
    </div> },

    // Slide 5/10 — The Five Lenses (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 5 of 10</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>The Five Lenses</h2>
      <p style={{ fontSize: 14, color: c.fgS, lineHeight: 1.7, marginBottom: 14 }}>Each Watson-Glaser section tests a <strong style={{ color: c.fg }}>different part</strong> of the same machine:</p>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { sec: "Assumptions", col: "#EC4899", tests: "The hidden glue", q: "Is the author relying on this unstated belief?" },
          { sec: "Arguments", col: "#3B82F6", tests: "The premises", q: "Is this premise relevant and significant enough to matter?" },
          { sec: "Deduction", col: "#F59E0B", tests: "The conclusion (strict)", q: "Does this follow with 100% certainty?" },
          { sec: "Interpretation", col: "#10B981", tests: "The conclusion (reasonable)", q: "Does this follow beyond reasonable doubt?" },
          { sec: "Inference", col: "#6366F1", tests: "The conclusion (spectrum)", q: "How confident should you be in this conclusion?" },
        ].map((r, i) => (
          <div key={i} style={{ padding: "10px 14px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "start" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.col, fontFamily: fonts.m }}>{r.sec}</span>
              <p style={{ fontSize: 11, color: c.mt, marginTop: 2 }}>{r.tests}</p>
            </div>
            <p style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.5, fontStyle: "italic" }}>&ldquo;{r.q}&rdquo;</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Three of the five sections (Deduction, Interpretation, Inference) all test conclusions — just at different thresholds of certainty. Knowing which threshold applies is half the battle.</p>
      </div>
    </div> },

    // Slide 6/10 — The Conclusion Spectrum (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 6 of 10 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Conclusion Spectrum</h2>
      <div style={{ padding: 14, background: fc + "0A", borderRadius: 10, border: "1px solid " + fc + "20", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>The Concept:</strong> Three sections test conclusions, but with different standards of proof. Let&apos;s calibrate your judgment.</p>
      </div>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> &ldquo;In the UK, driving under the influence of alcohol is a criminal offence. Last Saturday night, police officers set up a breathalyser checkpoint on the M1 motorway.&rdquo;</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> The checkpoint was set up to catch drink-drivers.</p>
      </div>
      <MCQ qKey="ef3" question="How would each section judge this conclusion?" opts={["Deduction: Follows / Interpretation: Follows / Inference: True", "Deduction: Does Not Follow / Interpretation: Follows / Inference: Probably True", "Deduction: Follows / Interpretation: Does Not Follow / Inference: Insufficient Data", "Deduction: Does Not Follow / Interpretation: Does Not Follow / Inference: Probably False"]} correctArr={[1]} expText={"Deduction demands 100% certainty — the passage never explicitly states why the checkpoint was set up. It could have been for licence checks or a stolen vehicle search, so \"Does Not Follow.\" Interpretation asks \"beyond reasonable doubt\" — a breathalyser checkpoint on a Saturday night? A reasonable person would accept this is about drink-driving, so \"Follows.\" Inference allows nuance — it's highly likely given the context, but the passage doesn't explicitly state the purpose, so \"Probably True.\"\n\n💡 Pro Tip: Same passage, same conclusion, three different answers. The section you're in changes the rules. Always check which threshold applies before answering."} />
    </div> },

    // Slide 7/10 — Arguments: Testing the Premises (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 7 of 10 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Arguments: Testing the Premises</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Question:</strong> Should schools ban mobile phones during lessons?</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Argument:</strong> &ldquo;Yes; because students who use phones in class tend to get lower grades than those who don&apos;t.&rdquo;</p>
      </div>
      <MCQ qKey="ef4" question="Is this a strong or weak argument?" opts={["Strong Argument", "Weak Argument"]} correctArr={[0]} expText={"Apply the two pillars. Relevance: Does it address the exact question about banning phones in lessons? Yes. Significance: Does the outcome matter? Lower grades are a significant consequence. Both pillars hold — Strong Argument.\n\n💡 Pro Tip: In the Arguments section, you're not testing whether the conclusion follows. You're testing whether the premise is worth considering at all. It's a different skill entirely."} />
    </div> },

    // Slide 8/10 — Assumptions: Testing the Hidden Glue (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 8 of 10 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Assumptions: Testing the Hidden Glue</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> &ldquo;We should move our team meetings to Monday mornings to improve productivity for the rest of the week.&rdquo;</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> Team meetings have a positive effect on weekly productivity.</p>
      </div>
      <MCQ qKey="ef5" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[0]} expText={"The author leaps from \"move meetings to Monday\" to \"improve productivity.\" This only works if meetings actually help productivity. Negate it: \"Meetings have NO effect on productivity.\" The argument collapses — why move them if they don't help?\n\n💡 Pro Tip: In the Assumptions section, you're hunting for the invisible foundation stone. The passage gives you the premises and conclusion — your job is to find what's hiding in between."} />
    </div> },

    // Slide 9/10 — Putting It All Together (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: fc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: fc + "15", display: "inline-block", marginBottom: 16 }}>slide 9 of 10 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Putting It All Together</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> &ldquo;Research shows that employees who take regular breaks are 20% more productive. Our company should therefore introduce mandatory break times every 90 minutes.&rdquo;</p>
      </div>
      <MCQ qKey="ef6" question="If a Watson-Glaser question asked you to evaluate the assumption in this argument, what would you be looking for?" opts={["Whether 20% is a significant improvement", "Whether mandatory breaks will actually increase productivity at this specific company", "Whether the conclusion follows with 100% certainty", "Whether the research is probably reliable"]} correctArr={[1]} expText={"Option A is an Arguments question — testing premise strength. Option B is the assumption — the hidden link between general research and this specific company. Option C is a Deduction question — testing the conclusion. Option D is an Inference question — testing confidence in the evidence.\n\n💡 Pro Tip: The same passage can generate questions for all five sections. Knowing which part of the machine you're poking tells you exactly what to look for."} />
    </div> },

    // Slide 10/10 — Cheat Sheet
    { render: () => <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Ergo Fundamentals Cheat Sheet</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { rule: "The Formula", tip: "Premises + Assumptions → Conclusion" },
          { rule: "Premises", tip: "Stated facts. You can point to them in the text." },
          { rule: "Assumptions", tip: "Unstated beliefs. They live in the gap between premise and conclusion." },
          { rule: "Conclusions", tip: "The endpoint. What the author wants you to accept." },
          { rule: "Assumptions Section", tip: "\"Is the author relying on this hidden belief?\"" },
          { rule: "Arguments Section", tip: "\"Is this premise relevant and significant?\"" },
          { rule: "Deduction", tip: "\"Does this follow with 100% certainty?\" (Strict)" },
          { rule: "Interpretation", tip: "\"Does this follow beyond reasonable doubt?\" (Soft)" },
          { rule: "Inference", tip: "\"How confident should I be?\" (Spectrum)" },
          { rule: "The Key Insight", tip: "Same framework, five different lenses. Know which lens you're using." },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "155px 1fr", padding: "11px 14px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, alignItems: "start", gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: fc, fontFamily: fonts.m }}>{r.rule}</span>
            <span style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.55 }}>{r.tip}</span>
          </div>
        ))}
      </div>
    </div> },
  ];

  // ============================================================================
  // SLIDES
  // ============================================================================
  const logicSlides = [
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: lc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: lc + "15", display: "inline-block", marginBottom: 16 }}>foundation</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>The Rigid Rules of Logic</h2>
      <p style={{ fontSize: 15, lineHeight: 1.85, color: c.fgS }}>In Watson-Glaser, words do not have their conversational meanings. They have strict mathematical definitions.</p>
      <p style={{ fontSize: 15, lineHeight: 1.85, color: c.fgS, marginTop: 14 }}>A single word like <span style={{ background: "#FBBF2430", padding: "1px 6px", borderRadius: 4, fontWeight: 600, color: c.fg }}>Some</span> or <span style={{ background: "#FBBF2430", padding: "1px 6px", borderRadius: 4, fontWeight: 600, color: c.fg }}>Must</span> dictates the entire validity of a conclusion.</p>
    </div> },
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: lc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: lc + "15", display: "inline-block", marginBottom: 16 }}>exercise</span>
      <DragRank qKey="le1" title="The Hierarchy of Certainty" subtitle="Drag these terms into order from weakest to strongest, or use the arrow keys." items={["Most", "All", "Some"]} correctOrder={["Some", "Most", "All"]} expText="'Some' is the weakest: it only means at least one. 'Most' means a majority (>50%). 'All' is absolute: 100%, no exceptions." />
    </div> },
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: lc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: lc + "15", display: "inline-block", marginBottom: 16 }}>exercise</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Universals: The &ldquo;100%&rdquo; Words</h2>
      <p style={{ fontSize: 14, color: c.fgS, lineHeight: 1.7, marginBottom: 4 }}>These words allow for <strong style={{ color: c.fg }}>no exceptions</strong>. If a single counter-example exists, the statement is false.</p>
      <MCQ qKey="le2" multi question="Which of these are treated as universal (All) in logic?" opts={["Always", "Invariably", "Everyone", "Usually", "Must"]} correctArr={[0, 1, 2, 4]} expText="'Usually' allows for exceptions. The others are absolute: Always, Invariably, Everyone, and Must all mean 100% with zero exceptions." />
    </div> },
    { render: () => <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;Some&rdquo; Trap</h2>
      <div style={{ padding: 16, background: lc + "0A", borderRadius: 12, border: "1px solid " + lc + "20", marginBottom: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>In conversation, &ldquo;Some&rdquo; implies &ldquo;Not all.&rdquo; But in logic, <strong style={{ color: c.fg }}>&ldquo;Some&rdquo; only means &ldquo;at least one.&rdquo;</strong> It does not guarantee that there are exceptions.</p>
      </div>
      <TF qKey="le3" scenario={'"Some CEOs are billionaires."'} question='Does this logically prove that "Some CEOs are NOT billionaires"?' correct={false} expText='In logic, "Some" means an unknown amount greater than zero. It is entirely possible that ALL CEOs are billionaires. "Some" does not exclude "All".' />
    </div> },
    { render: () => <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;Most&rdquo; Middle Ground</h2>
      <div style={{ padding: 16, background: lc + "0A", borderRadius: 12, border: "1px solid " + lc + "20", marginBottom: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>&ldquo;Most&rdquo; is stronger than &ldquo;Some&rdquo; but (usually) weaker than &ldquo;All.&rdquo; It strictly means <strong style={{ color: c.fg }}>more than 50%</strong> of the group.</p>
      </div>
      <MCQ qKey="le4" question='If "Most lawyers work late", which conclusion must be true?' opts={["All lawyers work late", "At least 51% of lawyers work late", "Some lawyers do not work late"]} correctArr={[1]} expText='"Most" guarantees a majority: more than half. It does NOT guarantee that all do, and strictly "Most" can include "All", so you cannot be certain some do NOT.' />
    </div> },
    { render: () => <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Conditionals: If / Then</h2>
      <div style={{ padding: 16, background: lc + "0A", borderRadius: 12, border: "1px solid " + lc + "20", marginBottom: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>Deductions often hinge on <strong style={{ color: c.fg }}>sufficiency</strong> and <strong style={{ color: c.fg }}>necessity</strong>. The word &ldquo;If&rdquo; introduces a <strong style={{ color: c.fg }}>sufficient condition</strong>.</p>
      </div>
      <ClickID qKey="le5" label="Click the part of the below statement that poses a sufficient condition." segments={["If it is raining,", "the grass is wet."]} correctIdx={0} expText='"It is raining" is the sufficient condition. When true, wet grass is guaranteed. But the grass could also be wet for other reasons (sprinklers), so rain is sufficient but not necessary.' />
    </div> },
    { render: () => <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;Unless&rdquo; Rule</h2>
      <div style={{ padding: 16, background: lc + "0A", borderRadius: 12, border: "1px solid " + lc + "20", marginBottom: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>&ldquo;Unless&rdquo; is one of the trickiest words. It logically translates to <strong style={{ color: c.fg }}>&ldquo;If Not.&rdquo;</strong></p>
      </div>
      <MCQ qKey="le6" question='"You cannot vote unless you are 18." Which means the same thing?' opts={["If you are 18, you must vote", "If you are NOT 18, you cannot vote"]} correctArr={[1]} expText='"Unless" means "If Not." So: "You cannot vote unless you are 18" = "If you are NOT 18, you cannot vote." Being 18 is necessary but may not be sufficient.' />
    </div> },
    { render: () => <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Combining Quantifiers: Some + Some</h2>
      <div style={{ padding: 16, background: lc + "0A", borderRadius: 12, border: "1px solid " + lc + "20", marginBottom: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>Two <strong style={{ color: c.fg }}>&ldquo;Some&rdquo;</strong> statements about the same group create a <strong style={{ color: c.fg }}>logical dead end</strong>.</p>
      </div>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}>Premise 1: <strong style={{ color: c.fg }}>Some lions climb.</strong></p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}>Premise 2: <strong style={{ color: c.fg }}>Some lions run.</strong></p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}>Conclusion: <em>&ldquo;Some running lions climb.&rdquo;</em></p>
      </div>
      <TF qKey="le7" scenario="" question="Does the conclusion follow?" correct={false} expText="No! The climbing lions and running lions might be completely different lions. Two 'Some' statements create no guaranteed overlap." />
    </div> },
    { render: () => <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Combining Quantifiers: Most + Most</h2>
      <div style={{ padding: 16, background: lc + "0A", borderRadius: 12, border: "1px solid " + lc + "20", marginBottom: 18 }}>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>If you have two <strong style={{ color: c.fg }}>&ldquo;Most&rdquo;</strong> statements about the same group, they <strong style={{ color: c.fg }}>must overlap</strong>. If over 50% are A and over 50% are B, there is not enough room for zero overlap.</p>
      </div>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}>Premise 1: <strong style={{ color: c.fg }}>Most interns are tired.</strong></p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}>Premise 2: <strong style={{ color: c.fg }}>Most interns are hungry.</strong></p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}>Conclusion: <em>&ldquo;Some interns are tired AND hungry.&rdquo;</em></p>
      </div>
      <TF qKey="le8" scenario="" question="Does the conclusion follow?" correct={true} expText="Yes! If more than 50% are tired and more than 50% are hungry, there mathematically MUST be overlap. This is the key difference between 'Some + Some' (no inference) and 'Most + Most' (guaranteed overlap)." />
    </div> },
    { render: () => <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>The Logic Dictionary</h2>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: c.fgS, marginBottom: 20 }}>You have learned the strict definitions that Watson-Glaser relies on. Keep this reference in mind.</p>
      <div style={{ display: "grid", gap: 10 }}>
        {[
          { term: "All", def: "100%. No exceptions whatsoever. (Always, Must, Every, Invariably)", col: "#EF4444" },
          { term: "Most", def: "> 50%. A guaranteed majority.", col: "#F59E0B" },
          { term: "Some", def: "> 0%. At least one. Could include all.", col: "#10B981" },
          { term: "Unless", def: "Translates to \"If Not.\" Introduces a necessary condition.", col: "#8B5CF6" },
          { term: "Some + Some", def: "No valid inference. Groups may not overlap.", col: "#64748B" },
          { term: "Most + Most", def: "Guaranteed overlap. Valid inference.", col: lc },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "12px 16px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, alignItems: "center" }}>
            <Mono style={{ fontSize: 13, fontWeight: 700, color: r.col, minWidth: 90 }}>{r.term}</Mono>
            <span style={{ fontSize: 13, color: c.fgS, lineHeight: 1.5 }}>{r.def}</span>
          </div>
        ))}
      </div>
    </div> },
  ];

  const argSlides = [
    // Slide 1/12 — Welcome to Arguments (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ac + "15", display: "inline-block", marginBottom: 16 }}>slide 1 of 12</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Welcome to Arguments</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 16, background: ac + "0A", borderRadius: 12, border: "1px solid " + ac + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: ac, marginBottom: 6 }}>The Goal</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>In this section, you are given a question and a proposed argument. You must decide if the argument is <strong style={{ color: c.fg }}>strong</strong> or <strong style={{ color: c.fg }}>weak</strong>. A strong argument must satisfy two conditions.</p>
        </div>
        <div style={{ padding: 16, background: ac + "0A", borderRadius: 12, border: "1px solid " + ac + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: ac, marginBottom: 6 }}>The Two Pillars</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}><strong style={{ color: c.fg }}>Relevance:</strong> Does it answer the entire prompt, or just the general topic? <strong style={{ color: c.fg }}>Significance:</strong> Is the outcome important or worthwhile? There is a big difference between saving lives and saving 50 pence.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Most weak arguments fail on relevance, not significance. They sound convincing because they discuss the right topic — but they answer a slightly different question than the one being asked.</p>
      </div>
    </div> },

    // Slide 2/12 — The Two Pillars (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ac + "15", display: "inline-block", marginBottom: 16 }}>slide 2 of 12 — challenge</span>
      <MCQ qKey="s1" multi question="What makes an Argument Strong?" subtitle="Think about what separates a convincing argument from a weak one." opts={["Relevance", "Length", "Significance", "Complexity"]} correctArr={[0, 2]} expText={"The correct answers are Relevance and Significance. An argument must directly address the prompt (relevant) and carry real weight (significant). Length and complexity are irrelevant — a short, simple argument can be strong, and a long, complex one can be weak."} />
    </div> },

    // Slide 3/12 — The Two Pillars Explained (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ac + "15", display: "inline-block", marginBottom: 16 }}>slide 3 of 12</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>The Two Pillars</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 20, background: ac + "0A", borderRadius: 12, border: "1px solid " + ac + "20" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: ac }}>Relevance</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>Does it answer the <strong style={{ color: c.fg }}>entire prompt</strong>, or just the general topic? An argument about &ldquo;schools&rdquo; is not automatically relevant to a question about &ldquo;should maths be compulsory.&rdquo;</p>
        </div>
        <div style={{ padding: 20, background: ac + "0A", borderRadius: 12, border: "1px solid " + ac + "20" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: ac }}>Significance</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>Is the outcome <strong style={{ color: c.fg }}>important or worthwhile</strong>? There is a big difference between saving lives and saving 50 pence. A relevant argument with a trivial outcome is still weak.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Apply a two-step check: (1) Does this answer the exact question? (2) Does the outcome actually matter? Both must be yes for a strong argument.</p>
      </div>
    </div> },

    // Slide 4/12 — Spot the Fallacy (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ac + "15", display: "inline-block", marginBottom: 16 }}>slide 4 of 12</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Spot the Fallacy</h2>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: c.fgS, marginBottom: 18 }}>A <strong style={{ color: c.fg }}>fallacy</strong> is a flaw in reasoning that makes an argument weak. Over the next seven slides, identify which type each argument contains.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["Red Herring", "Diverts attention to an unrelated point"], ["Slogan", "A catchy phrase disguised as reasoning"], ["Slippery Slope", "Predicting extreme consequences without proof"], ["Circular Argument", "The conclusion just restates the premise"], ["Appeal", "Using emotion instead of evidence"], ["Correlation not Causation", "Two things happen together, so one must cause the other"], ["Anecdote", "One personal story treated as universal proof"]].map((f, i) => (
          <div key={i} style={{ padding: 12, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{f[0]}</div>
            <div style={{ fontSize: 12, color: c.mt, lineHeight: 1.5 }}>{f[1]}</div>
          </div>
        ))}
      </div>
    </div> },

    // Slides 5-11 — Seven Fallacy Challenges
    ...fallacies.map((f, fi) => ({
      render: () => (
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ac + "15", display: "inline-block", marginBottom: 14 }}>slide {fi + 5} of 12 — challenge</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.prompt}</h2>
          <div style={{ padding: 16, background: c.mtBg, borderRadius: 12, border: "1px solid " + c.bd, marginBottom: 16 }}>
            <p style={{ fontSize: 14, lineHeight: 1.7, fontStyle: "italic", color: c.fgS }}>&ldquo;{f.arg}&rdquo;</p>
          </div>
          <MCQ qKey={"f" + fi} question="Which fallacy is this?" opts={f.opts} correctArr={[f.correct]} expText={(ans["f" + fi] === f.correct ? "" : ("The answer is " + f.name + ". ")) + f.exp} />
        </div>
      ),
    })),

    // Slide 12/12 — Cheat Sheet
    { render: () => <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Arguments Cheat Sheet</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { rule: "Relevance", tip: "Does it answer the exact question being asked, not just the general topic?" },
          { rule: "Significance", tip: "Is the outcome important? A trivial benefit makes a weak argument." },
          { rule: "Red Herring", tip: "Shifts to an unrelated point. True but answers a different question." },
          { rule: "Slogan", tip: "A catchy phrase that sounds inspiring but provides no actual reasoning." },
          { rule: "Slippery Slope", tip: "Predicts an extreme chain reaction with no evidence linking the steps." },
          { rule: "Circular Argument", tip: "The conclusion just restates the premise in different words." },
          { rule: "Appeal to Emotion", tip: "Makes you feel something instead of think something. Not evidence." },
          { rule: "Correlation ≠ Causation", tip: "Two things happening together does not prove one caused the other." },
          { rule: "Anecdote", tip: "One personal story proves nothing about a general rule or policy." },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "155px 1fr", padding: "11px 14px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, alignItems: "start", gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ac, fontFamily: fonts.m }}>{r.rule}</span>
            <span style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.55 }}>{r.tip}</span>
          </div>
        ))}
      </div>
    </div> },
  ];

  // ============================================================================
  // INFERENCE SLIDES
  // ============================================================================
  const ic = secInfo.Inference.color;
  const inferenceSlides = [
    // Slide 1/11 — Welcome to Inferences (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 1 of 11</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Welcome to Inferences</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 16, background: ic + "0A", borderRadius: 12, border: "1px solid " + ic + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: ic, marginBottom: 6 }}>The 5-Point Scale</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>Unlike other sections, Inferences are not just Yes or No. You must evaluate a statement based on a passage and assign it to a spectrum of truth: <strong style={{ color: c.fg }}>True</strong>, <strong style={{ color: c.fg }}>Probably True</strong>, <strong style={{ color: c.fg }}>Insufficient Data</strong>, <strong style={{ color: c.fg }}>Probably False</strong>, or <strong style={{ color: c.fg }}>False</strong>.</p>
        </div>
        <div style={{ padding: 16, background: ic + "0A", borderRadius: 12, border: "1px solid " + ic + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: ic, marginBottom: 6 }}>The Golden Rule</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>You must base your decision only on the information provided in the text and universally accepted &ldquo;common knowledge&rdquo; (e.g., rain makes things wet). Do <strong style={{ color: c.fg }}>not</strong> bring in outside specialist knowledge.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> &ldquo;True&rdquo; and &ldquo;False&rdquo; require absolute certainty based on the text. &ldquo;Probably True&rdquo; and &ldquo;Probably False&rdquo; are for highly likely logical deductions. &ldquo;Insufficient Data&rdquo; is the trap for when you simply cannot know.</p>
      </div>
    </div> },

    // Slide 2/11 — The Explicit Fact (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 2 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Explicit Fact</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> The company&apos;s revenue grew by 15% in Q3, reaching a record high of $2 million.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> The company&apos;s Q3 revenue was higher than in any previous quarter.</p>
      </div>
      <MCQ qKey="inf1" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[0]} expText={"\"True\" means the statement is an undeniable fact based on the text. The text explicitly says $2 million is a \"record high.\" By definition, a record high means it is higher than any previous quarter. It is a direct paraphrase.\n\n💡 Pro Tip: If you can point to the exact words in the passage that prove the statement 100%, the answer is True."} />
    </div> },

    // Slide 3/11 — The Logical Step (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 3 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Logical Step</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> The heavy rain caused the river to burst its banks. The local town council had failed to maintain the flood defences for three years.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> The flood defences were in poor condition when the river burst its banks.</p>
      </div>
      <MCQ qKey="inf2" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[1]} expText={"The text does not explicitly say the defences were broken or in poor condition. However, it says the council \"failed to maintain\" them for three years. Common knowledge dictates that unmaintained physical defences will likely deteriorate. It's a highly reasonable deduction, but stops just short of 100% absolute \"True.\" Probably True."} />
    </div> },

    // Slide 4/11 — Correlation vs. Causation (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 4 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Correlation vs. Causation</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> A long-term study showed that people who drink two cups of green tea a day live longer on average than those who do not drink green tea.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> Drinking green tea causes people to live longer.</p>
      </div>
      <MCQ qKey="inf3" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[2]} expText={"This is the classic Correlation ≠ Causation trap. The text observes a link (drinking tea and living longer), but it does not prove that the tea is the cause. The tea drinkers might also exercise more, eat better, or have lower stress.\n\n💡 Pro Tip: Without proof of the mechanism, you cannot assume cause and effect. If the text says \"X happens alongside Y,\" you cannot infer \"X causes Y.\""} />
    </div> },

    // Slide 5/11 — The Unlikely Scenario (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 5 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Unlikely Scenario</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> John is a strict vegan who actively campaigns for animal rights and avoids all animal byproducts in his diet and clothing.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> John&apos;s favourite restaurant is a local steakhouse.</p>
      </div>
      <MCQ qKey="inf4" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[3]} expText={"Is it impossible for a vegan to love a steakhouse? Technically no — perhaps they have a great salad bar, or he loves the décor. Because it's not a 100% direct contradiction, it's not \"False.\" However, it is highly improbable that a strict animal rights campaigner's favourite place is a steakhouse. Probably False."} />
    </div> },

    // Slide 6/11 — The Direct Contradiction (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 6 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Direct Contradiction</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> The new software update was scheduled for Tuesday but was delayed until Friday due to unforeseen bugs in the code.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> The software update was released on Tuesday.</p>
      </div>
      <MCQ qKey="inf5" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[4]} expText={"The statement directly contradicts the explicit facts of the passage. The passage unequivocally states the update was delayed until Friday. Therefore, it is 100% False that it was released on Tuesday."} />
    </div> },

    // Slide 7/11 — The Absolute Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 7 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Absolute Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Company X offers a flexible work-from-home policy to its senior software engineers to boost morale.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> Every employee at Company X is allowed to work from home.</p>
      </div>
      <MCQ qKey="inf6" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[2]} expText={"The passage specifies a perk for \"senior software engineers.\" The inference uses the absolute word \"Every.\" We have absolutely no data about the HR policies for junior engineers, HR staff, or janitors. Insufficient Data.\n\n💡 Pro Tip: Beware of absolute words in the inference (All, Every, Never, Always). They are very difficult to prove \"True\" and often lead to Insufficient Data or False."} />
    </div> },

    // Slide 8/11 — The Common Knowledge Rule (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 8 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Common Knowledge Rule</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> During the drive to the office, the car&apos;s engine began smoking heavily and making a loud, continuous grinding noise.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> The car is experiencing a mechanical problem.</p>
      </div>
      <MCQ qKey="inf7" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[1]} expText={"The text describes the symptoms (smoke, grinding) but does not use the exact phrase \"mechanical problem.\" However, basic \"common knowledge\" (which you are allowed to use) dictates that smoke and grinding in an engine indicate a mechanical issue. It's not 100% \"True\" because it could technically be a movie prop car designed to do that, but it is highly probable. Probably True."} />
    </div> },

    // Slide 9/11 — Predicting the Future (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 9 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Predicting the Future</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> The City Council allocated $50 million to build a new tram line. Two years after opening, traffic congestion remains at the exact same levels as before the tram was built.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> If the tram line had not been built, traffic congestion would be much worse today.</p>
      </div>
      <MCQ qKey="inf8" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[2]} expText={"We only know what did happen: congestion stayed the same. We do not know the underlying trends. Maybe population growth was massive, meaning the tram did stop it from getting worse. Or maybe population shrank, meaning the tram was useless. The text gives us no data to build a hypothetical alternate reality. Insufficient Data."} />
    </div> },

    // Slide 10/11 — The "How" vs. The "What" (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: ic, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: ic + "15", display: "inline-block", marginBottom: 16 }}>slide 10 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;How&rdquo; vs. The &ldquo;What&rdquo;</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> By 1920, Asian plantations produced rubber at half the cost of Brazilian plantations, causing the Brazilian rubber economy to collapse completely.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Inference:</strong> Asian plantations were able to produce cheaper rubber because they paid their workers lower wages than the Brazilians did.</p>
      </div>
      <MCQ qKey="inf9" question="What is the correct answer?" opts={["True", "Probably True", "Insufficient Data", "Probably False", "False"]} correctArr={[2]} expText={"The passage tells us what happened (cost was half), but it tells us nothing about how or why it happened. Lower wages are a plausible guess, but cheaper shipping, better technology, or higher crop yields are equally plausible. Don't invent the mechanism if the text doesn't provide it! Insufficient Data."} />
    </div> },

    // Slide 11/11 — Cheat Sheet
    { render: () => <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Inferences Cheat Sheet</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { rule: "True", tip: "You can point to exact words in the passage that prove it 100%." },
          { rule: "Probably True", tip: "A highly reasonable deduction using the text + common knowledge. Not quite 100%." },
          { rule: "Insufficient Data", tip: "The passage simply does not give you enough to decide either way." },
          { rule: "Probably False", tip: "Highly unlikely given the text, but not a direct 100% contradiction." },
          { rule: "False", tip: "The passage explicitly and directly contradicts the statement." },
          { rule: "Correlation ≠ Causation", tip: "\"X alongside Y\" does not mean \"X causes Y\" without proof of mechanism." },
          { rule: "Beware absolutes", tip: "All, Every, Never, Always — extremely hard to prove True from limited text." },
          { rule: "Common knowledge OK", tip: "Rain is wet, smoke means fire — basic universal facts are allowed." },
          { rule: "\"What\" ≠ \"How\"", tip: "Knowing an outcome does not mean you know the cause or mechanism." },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "155px 1fr", padding: "11px 14px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, alignItems: "start", gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ic, fontFamily: fonts.m }}>{r.rule}</span>
            <span style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.55 }}>{r.tip}</span>
          </div>
        ))}
      </div>
    </div> },
  ];

  // ============================================================================
  // ASSUMPTIONS SLIDES
  // ============================================================================
  const asc = secInfo.Assumptions.color;
  const assumptionSlides = [
    // Slide 1/12 — Welcome to Assumptions (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 1 of 12</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Welcome to Assumptions</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 16, background: asc + "0A", borderRadius: 12, border: "1px solid " + asc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: asc, marginBottom: 6 }}>The Hidden Foundation</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>In the Watson-Glaser test, an assumption is something <strong style={{ color: c.fg }}>taken for granted</strong> or presupposed by the author. It is the unwritten rule that connects their facts to their conclusion.</p>
        </div>
        <div style={{ padding: 16, background: asc + "0A", borderRadius: 12, border: "1px solid " + asc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: asc, marginBottom: 6 }}>The Golden Rule</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>You are not judging whether the assumption is true in the real world. You are judging whether the author is <strong style={{ color: c.fg }}>relying on it</strong> to make their specific argument work.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Think of an assumption as a foundation stone. If you pull it out, the entire argument collapses. If the argument still stands without it, it was never part of the foundation.</p>
      </div>
    </div> },

    // Slide 2/12 — The Foundation (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 2 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Foundation</h2>
      <div style={{ padding: 14, background: asc + "0A", borderRadius: 10, border: "1px solid " + asc + "20", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>The Concept:</strong> An assumption is a necessary foundation stone. If you take it away, the passage cannot stand &mdash; the argument crumbles. If the argument survives without it, that stone was never part of the foundation.</p>
      </div>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> I am going to the beach today, so I will get a sunburn.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> It is sunny today.</p>
      </div>
      <MCQ qKey="as1" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[0]} expText={"Remove this foundation stone: imagine it is NOT sunny today. Now the author's leap from \"beach\" to \"sunburn\" makes no sense — the argument collapses. The sun being out is a necessary foundation that the entire passage rests upon.\n\n💡 Pro Tip: Ask yourself: \"Can this passage exist without this statement being true?\" If the answer is no, it is a foundation stone — Assumption Made."} />
    </div> },

    // Slide 3/12 — Step 1: The Reframing Test (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 3 of 12 — technique</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Step 1: The Reframing Test</h2>
      <div style={{ padding: 14, background: asc + "0A", borderRadius: 10, border: "1px solid " + asc + "20", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>The Technique:</strong> Take the proposed assumption and slot it into the passage as if the author had written it. Does it read naturally? Does it fill a gap the argument needs? If it fits seamlessly, the author was probably relying on it. If it sounds random or irrelevant, it&apos;s not an assumption.</p>
      </div>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> I am travelling to Paris tomorrow, so I will visit the Eiffel Tower.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 10 }}><strong style={{ color: c.fg }}>Test Assumption A:</strong> &ldquo;The Eiffel Tower is located in Paris.&rdquo;</p>
        <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.7, fontStyle: "italic", marginTop: 4, padding: "8px 12px", background: c.gn + "0C", borderRadius: 8, border: "1px solid " + c.gn + "20" }}>&rarr; Reframed: &ldquo;I am travelling to Paris tomorrow. <strong style={{ color: c.gn }}>The Eiffel Tower is located in Paris.</strong> So I will visit the Eiffel Tower.&rdquo; &mdash; Fits perfectly. The passage needs this to make sense.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 10 }}><strong style={{ color: c.fg }}>Test Assumption B:</strong> &ldquo;Paris is the capital of France.&rdquo;</p>
        <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.7, fontStyle: "italic", marginTop: 4, padding: "8px 12px", background: c.rd + "0C", borderRadius: 8, border: "1px solid " + c.rd + "20" }}>&rarr; Reframed: &ldquo;I am travelling to Paris tomorrow. <strong style={{ color: c.rd }}>Paris is the capital of France.</strong> So I will visit the Eiffel Tower.&rdquo; &mdash; True fact, but random. It adds nothing to the argument&apos;s logic.</p>
      </div>
      <MCQ qKey="as_rf" question="Which statement is the author actually assuming?" opts={["The Eiffel Tower is located in Paris", "Paris is the capital of France"]} correctArr={[0]} expText={"The Reframing Test is your quick first filter. Assumption A slots in and connects the dots — the author needs the tower to be in Paris for the visit to make sense. Assumption B is true but irrelevant — whether Paris is a capital has nothing to do with visiting the Eiffel Tower.\n\n💡 Pro Tip: Use the Reframing Test as Step 1 (quick intuition check), then confirm with Step 2: the Negation Test (rigorous logic check)."} />
    </div> },

    // Slide 4/12 — Step 2: The Negation Test (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 4 of 12 — technique</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Step 2: The Negation Test</h2>
      <div style={{ padding: 14, background: asc + "0A", borderRadius: 10, border: "1px solid " + asc + "20", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>The Technique:</strong> Take the proposed assumption and make it false (negate it). If the argument collapses, the assumption is a necessary foundation stone &mdash; Assumption Made. If the argument still works, it was never part of the foundation &mdash; Assumption Not Made.</p>
      </div>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> We need to hire more sales staff to increase revenue.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> New staff can find customers.</p>
      </div>
      <MCQ qKey="as2" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[0]} expText={"Negate the assumption: \"New staff CANNOT find customers.\" Does the author's plan to increase revenue still work? No — if new hires can't find customers, hiring them is pointless. The argument collapses. Assumption Made.\n\n💡 Pro Tip: The two-step method — (1) Reframe it into the passage, (2) Negate it — gives you both a quick gut check and rigorous confirmation."} />
    </div> },

    // Slide 5/12 — The Necessity Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 5 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Necessity Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Our sales are down. We must launch a TV ad campaign to save the company.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> TV ads are the cheapest marketing option.</p>
      </div>
      <MCQ qKey="as3" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[1]} expText={"An assumption isn't just a fact that supports the argument — it is a load-bearing foundation stone the argument must have. TV ads might be incredibly expensive, but the author assumes they are the only thing powerful enough to save the company.\n\n💡 Pro Tip: Spot the difference between a helpful bonus and a strict requirement. The author assumes the ads will work, not that they are cheap."} />
    </div> },

    // Slide 6/12 — The Guarantee Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 6 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Guarantee Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> To get into Harvard, you need high grades.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> If you have high grades, you will definitely get into Harvard.</p>
      </div>
      <MCQ qKey="as4" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[1]} expText={"An assumption must be necessary (a required prerequisite). It doesn't have to be sufficient (enough on its own to guarantee the outcome). High grades are necessary, but the author doesn't assume they are enough to guarantee entry — they might also require extracurriculars.\n\n💡 Pro Tip: Do not confuse a requirement with a guarantee! A necessary condition is not a sufficient one."} />
    </div> },

    // Slide 7/12 — The Preference Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 7 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Preference Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> To increase our profit margins, we must switch to cheaper, lower-quality materials.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> Increasing profit margins is more important than maintaining high product quality.</p>
      </div>
      <MCQ qKey="as5" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[0]} expText={"When an author proposes a plan to achieve a specific result, they automatically assume that the result is actually desired. They are making a hidden value judgment. If quality were the higher priority, the argument would fall apart. Assumption Made.\n\n💡 Pro Tip: If a passage sacrifices X to achieve Y, the author assumes Y is more important than X."} />
    </div> },

    // Slide 8/12 — The Superlative Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 8 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Superlative Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Product X is better than Product Y because it is cheaper.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> Price is the only factor that matters to consumers.</p>
      </div>
      <MCQ qKey="as6" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[1]} expText={"Watch out for extreme words: All, None, Always, Never, Best, Worst, Only. Authors rarely assume extremes unless they explicitly state them. The author assumes price is a factor — or the deciding factor here — but they don't assume quality or durability don't matter at all.\n\n💡 Pro Tip: The word \"only\" is usually a trap. Be highly sceptical of absolute statements."} />
    </div> },

    // Slide 9/12 — The Prediction Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 9 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Prediction Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> The CEO presided over a massive financial loss, so she should resign immediately.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> The CEO will resign.</p>
      </div>
      <MCQ qKey="as7" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[1]} expText={"Don't confuse an opinion about what ought to happen (\"should\") with a prediction of what will happen (\"will\"). The argument is a moral/strategic opinion about what is right, not a crystal-ball prediction of the future.\n\n💡 Pro Tip: Match the tone of the passage. An assumption about a recommendation is very different from an assumption about a future fact."} />
    </div> },

    // Slide 10/12 — The Relevance Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 10 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Relevance Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> I am travelling to Paris tomorrow, so I will visit the Eiffel Tower.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> Paris is the capital of France.</p>
      </div>
      <MCQ qKey="as8" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[1]} expText={"Yes, this is a true fact in the real world. But does the author's plan rely on Paris being the capital? No. They just rely on the Eiffel Tower being located there. Being a capital city is irrelevant to visiting a specific landmark.\n\n💡 Pro Tip: Use the Reframing Test — slot it in and ask: does this connect the dots? \"I'm going to Paris. Paris is the capital. So I'll visit the Eiffel Tower.\" The middle sentence adds nothing. It's a true but irrelevant distraction."} />
    </div> },

    // Slide 11/12 — The Causation Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: asc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: asc + "15", display: "inline-block", marginBottom: 16 }}>slide 11 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Causation Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Studies show that populations who consume high amounts of olive oil have lower rates of heart disease. Therefore, adding olive oil to one&apos;s diet is the most effective way to prevent a heart attack.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Assumption:</strong> Olive oil consumption is the direct cause of the lower heart disease rates.</p>
      </div>
      <MCQ qKey="as9" question="Is this an assumption made by the author?" opts={["Assumption Made", "Assumption Not Made"]} correctArr={[0]} expText={"The author observes two things happening together (a correlation between eating olive oil and having a healthy heart) and concludes that one caused the other. By claiming olive oil prevents heart attacks, the author must implicitly rule out all other possible causes — such as these populations exercising more, eating less sugar, or having better genetics.\n\n💡 Pro Tip: Whenever an argument observes a trend and prescribes a solution (\"X and Y happen together, so do X to get Y\"), look for the assumption that ignores hidden variables. The author must assume X is the true cause!"} />
    </div> },

    // Slide 12/12 — Cheat Sheet
    { render: () => <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Assumptions Cheat Sheet</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { rule: "The Foundation", tip: "An assumption is a foundation stone. Remove it and the argument collapses." },
          { rule: "Step 1: Reframing", tip: "Slot the assumption into the passage. Does it connect the dots naturally?" },
          { rule: "Step 2: Negation", tip: "Negate the assumption. If the argument collapses → Assumption Made." },
          { rule: "The Necessity Trap", tip: "It must be a load-bearing pillar, not just a supportive bonus." },
          { rule: "The Guarantee Trap", tip: "A requirement is not a guarantee. Necessary ≠ sufficient." },
          { rule: "The Preference Trap", tip: "If a plan sacrifices X for Y, the author assumes Y matters more than X." },
          { rule: "The Superlative Trap", tip: "Extreme words (only, always, never) are traps. Authors rarely assume absolutes." },
          { rule: "The Prediction Trap", tip: "\"Should\" is not \"will.\" A recommendation is not a prediction." },
          { rule: "The Relevance Trap", tip: "A true fact is not an assumption unless the argument depends on it." },
          { rule: "The Causation Trap", tip: "If the author prescribes a solution from a trend, they assume direct causation." },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "155px 1fr", padding: "11px 14px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, alignItems: "start", gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: asc, fontFamily: fonts.m }}>{r.rule}</span>
            <span style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.55 }}>{r.tip}</span>
          </div>
        ))}
      </div>
    </div> },
  ];

  // ============================================================================
  // DEDUCTION SLIDES
  // ============================================================================
  const dc = secInfo.Deduction.color;
  const deductionSlides = [
    // Slide 1/11 — Welcome to Deductions (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 1 of 11</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Welcome to Deductions</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 16, background: dc + "0A", borderRadius: 12, border: "1px solid " + dc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: dc, marginBottom: 6 }}>The Golden Rule</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>The Watson-Glaser Deductions section does not test how smart you are in the real world. It tests your ability to play a rigid game of <strong style={{ color: c.fg }}>formal logic</strong>.</p>
        </div>
        <div style={{ padding: 16, background: dc + "0A", borderRadius: 12, border: "1px solid " + dc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: dc, marginBottom: 6 }}>The Bubble</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>The short passage they give you is your <strong style={{ color: c.fg }}>entire universe</strong>. If the text says &ldquo;the sky is green,&rdquo; then the sky is green.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Leave your common sense at the door. If a fact is not explicitly written in the passage, it simply does not exist.</p>
      </div>
    </div> },

    // Slide 2/11 — The Two Buttons (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 2 of 11</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>The Two Buttons</h2>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, color: c.fgS, marginBottom: 16 }}>You only have two choices, and they have incredibly strict definitions:</p>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ padding: 16, background: c.gn + "0A", borderRadius: 12, border: "1px solid " + c.gn + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: c.gn, marginBottom: 6 }}>Conclusion Follows</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>The conclusion is <strong style={{ color: c.fg }}>100%, mathematically, undeniably true</strong> based only on the text provided.</p>
        </div>
        <div style={{ padding: 16, background: c.rd + "0A", borderRadius: 12, border: "1px solid " + c.rd + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: c.rd, marginBottom: 6 }}>Conclusion Does Not Follow</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>There is even a <strong style={{ color: c.fg }}>1% chance</strong> it could be false, OR it requires outside information to prove.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Beware of &ldquo;Probably.&rdquo; If you read a conclusion and think, &ldquo;Yeah, that&apos;s highly likely&rdquo; — the correct answer is <strong style={{ color: c.fg }}>Conclusion Does Not Follow</strong>. Logic demands absolute certainty.</p>
      </div>
    </div> },

    // Slide 3/11 — The "If/Then" Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 3 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;If/Then&rdquo; Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> If it is raining outside, the grass is wet.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> The grass is wet, therefore it is raining.</p>
      </div>
      <MCQ qKey="ded1" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"Cause and effect are not always reversible. The text tells you what happens when it rains. It tells you nothing about other ways grass gets wet. Someone could have left a sprinkler on!\n\n💡 Pro Tip: Never read an \"If/Then\" statement backwards. It is a one-way street."} />
    </div> },

    // Slide 4/11 — The Contrapositive (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 4 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Contrapositive</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> If you are a dog, you are an animal.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> You are not an animal, therefore you are not a dog.</p>
      </div>
      <MCQ qKey="ded2" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"The only mathematically correct way to reverse an \"If/Then\" statement is to flip the order AND make both sides negative. If you are entirely outside the \"animal\" category, it is impossible for you to be inside the \"dog\" category.\n\n💡 Pro Tip: If a conclusion gives you the exact opposite of the result, you can perfectly deduce the exact opposite of the cause."} />
    </div> },

    // Slide 5/11 — The Biconditional (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 5 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Biconditional</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> You will receive a bonus if and only if you double your sales.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> You received a bonus, therefore you doubled your sales.</p>
      </div>
      <MCQ qKey="ded3" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"Normally, \"If A, then B\" is a one-way street. But when a passage says \"if and only if,\" it becomes a two-way street. The two conditions are perfectly locked together. You can safely read this rule backwards.\n\n💡 Pro Tip: Whenever you see \"if and only if,\" draw a massive equals sign (=) in your mind. Condition A = Condition B."} />
    </div> },

    // Slide 6/11 — The "Only If" Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 6 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;Only If&rdquo; Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> You can get the job only if you pass the background check.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> John passed the background check, so he will definitely get the job.</p>
      </div>
      <MCQ qKey="ded4" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"\"Only if\" sets a requirement — it does not guarantee an outcome. Removing a barrier does not mean you automatically get the result. John passed the check, but he might still bomb the interview!\n\n💡 Pro Tip: Think of \"only if\" as unlocking a door. You still have to walk through it."} />
    </div> },

    // Slide 7/11 — The "OR" Rule (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 7 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;OR&rdquo; Rule</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> You are currently practising for the Watson-Glaser test.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> You are practising for the Watson-Glaser test OR you are currently on fire.</p>
      </div>
      <MCQ qKey="ded5" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"In formal logic, an \"A or B\" statement is legally true as long as one half of it is true. Because the first half is an established fact, the entire \"OR\" statement is technically impossible to be false.\n\n💡 Pro Tip: If you can prove one side of an \"OR\" conclusion is true based on the text, stop looking. The conclusion follows, no matter how ridiculous the second half sounds."} />
    </div> },

    // Slide 8/11 — The Quantifier Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 8 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Quantifier Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Some employees in the marketing department wear blue shirts.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> All employees in the marketing department wear blue shirts.</p>
      </div>
      <MCQ qKey="ded6" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"Absolute words are the easiest way to catch a bad conclusion. In logic, \"Some\" means anything from 1% to 99%. It just means \"at least one.\" You cannot mathematically upgrade \"Some\" to \"All\" (100%).\n\n💡 Pro Tip: If a passage uses a weak word like \"Some,\" a conclusion that uses a strong word like \"All\" almost always fails. (Check the Logic Essentials slides for more detail)"} />
    </div> },

    // Slide 9/11 — The "Most" Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 9 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;Most&rdquo; Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Most doctors wear white coats. Bob is a doctor.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> Bob wears a white coat.</p>
      </div>
      <MCQ qKey="ded7" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"\"Most\" simply means 51% to 99%. While it is highly likely Bob wears a white coat, he could easily be in the minority that wears blue scrubs. Remember Slide 2: Logic requires 100% certainty.\n\n💡 Pro Tip: Never apply a statistical majority to a specific individual. For a specific person, \"Most\" = \"Does Not Follow.\" (Check the Logic Essentials slides for more detail)"} />
    </div> },

    // Slide 10/11 — The Void of Information (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: dc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: dc + "15", display: "inline-block", marginBottom: 16 }}>slide 10 of 11 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Void of Information</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> The company bought new laptops for the sales team.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Conclusion:</strong> The marketing team did not get new laptops.</p>
      </div>
      <MCQ qKey="ded8" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"If the passage doesn't mention something, you cannot make a deduction about it. Period. The text is completely silent on the marketing team. Maybe they got laptops, maybe they didn't. We have no idea.\n\n💡 Pro Tip: Silence is not a \"Yes\" or a \"No.\" If you have to say \"I don't know,\" the answer is always Conclusion Does Not Follow. Don't fill in the blanks the test-makers left empty!"} />
    </div> },

    // Slide 11/11 — Summary
    { render: () => <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Deduction Cheat Sheet</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { rule: "If/Then is one-way", tip: "\"If A then B\" does NOT mean \"If B then A.\" Never read it backwards." },
          { rule: "Contrapositive works", tip: "Flip the order AND negate both sides. \"Not B → Not A\" is always valid." },
          { rule: "\"If and only if\" = two-way", tip: "This is the only time you can safely read a conditional backwards." },
          { rule: "\"Only if\" ≠ guaranteed", tip: "Meeting a requirement does not guarantee the outcome." },
          { rule: "OR = one side is enough", tip: "If one half of an OR statement is proven true, the whole thing follows." },
          { rule: "Some ≠ All", tip: "You can never upgrade a weak quantifier to an absolute one." },
          { rule: "Most ≠ This one", tip: "A statistical majority says nothing about a specific individual." },
          { rule: "Silence ≠ Evidence", tip: "If the passage doesn't mention it, you cannot conclude anything about it." },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", padding: "11px 14px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, alignItems: "start", gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: dc, fontFamily: fonts.m }}>{r.rule}</span>
            <span style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.55 }}>{r.tip}</span>
          </div>
        ))}
      </div>
    </div> },
  ];

  // ============================================================================
  // INTERPRETATION SLIDES
  // ============================================================================
  const itc = secInfo.Interpretation.color;
  const interpretationSlides = [
    // Slide 1/12 — Welcome to Interpretations (Informative)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 1 of 12</span>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Welcome to Interpretations</h2>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 16, background: itc + "0A", borderRadius: 12, border: "1px solid " + itc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: itc, marginBottom: 6 }}>The Goal</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>In this section, you are given a short passage and a proposed conclusion. You must decide if the conclusion logically follows <strong style={{ color: c.fg }}>beyond a reasonable doubt</strong>.</p>
        </div>
        <div style={{ padding: 16, background: itc + "0A", borderRadius: 12, border: "1px solid " + itc + "20" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: itc, marginBottom: 6 }}>Pay attention to the rules!</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: c.fgS }}>In Deductions, conclusions must follow strictly and necessarily from the passage. In Interpretations, they only need to follow beyond a reasonable doubt.</p>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: "10px 14px", background: c.acS, borderRadius: 10, border: "1px solid " + c.ac + "20" }}>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: c.fgS }}>💡 <strong style={{ color: c.fg }}>Pro Tip:</strong> Judge each conclusion independently. Once you finish evaluating Conclusion 1, erase it from your brain. Do not let it influence Conclusion 2. Your only source of truth is the original paragraph.</p>
      </div>
    </div> },

    // Slide 2/12 — Calibrating "Reasonable" Doubt (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 2 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Calibrating &ldquo;Reasonable&rdquo; Doubt</h2>
      <div style={{ padding: 14, background: itc + "0A", borderRadius: 10, border: "1px solid " + itc + "20", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>The Rule:</strong> The official test asks you to find conclusions that follow &ldquo;beyond a reasonable doubt,&rdquo; explicitly stating they do not have to follow &ldquo;absolutely and necessarily.&rdquo;</p>
      </div>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> To board the international flight from London to Tokyo, passengers are required by airline policy to present a valid passport to the agent at the departure gate. Sarah boarded this flight yesterday and arrived in Tokyo this morning.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> Sarah presented a valid passport at the departure gate.</p>
      </div>
      <MCQ qKey="int1" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"In pure, strict logic (like the Deductions section), you might argue: \"What if she bribed the gate agent? What if she snuck through an air vent?\" Technically, those scenarios are possible. But Interpretations test reasonable deduction. It is beyond a reasonable doubt that a passenger on an international flight followed the mandatory boarding procedure. Don't let hyper-paranoia ruin a perfectly good inference!"} />
    </div> },

    // Slide 3/12 — The "Correlation vs. Causation" Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 3 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;Correlation vs. Causation&rdquo; Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Campus canteens replaced meat options with plant-based alternatives. This transition coincided with a 15% reduction in the university&apos;s carbon footprint.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> The reduction in meat sales led to the reduced carbon footprint.</p>
      </div>
      <MCQ qKey="int2" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"The text says the events \"coincided\" (happened at the same time). It actively avoids saying one caused the other. Even though real-world knowledge tells you less meat equals less carbon, the test requires strict adherence to the text. The university might have installed solar panels at the exact same time!"} />
    </div> },

    // Slide 4/12 — The Overlapping Sets Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 4 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Overlapping Sets Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> A survey found that 72% of remote workers report high job satisfaction, but 40% of those same remote workers report feeling isolated.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> Some remote workers experience both high job satisfaction and feelings of isolation.</p>
      </div>
      <MCQ qKey="int3" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"This is pure maths disguised as text. If you add 72% and 40%, you get 112%. Because a population cannot exceed 100%, there is a forced overlap of at least 12%. Therefore, \"some\" workers must be in both categories. (Check the Logic Essentials slides for more detail!)"} />
    </div> },

    // Slide 5/12 — The Scope Shift (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 5 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Scope Shift</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> In the 17th century, the Dutch East India Company burned their own warehouses of nutmeg to create artificial scarcity. This kept the price of nutmeg in London higher than the price of gold for a decade.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> The limitation of supply meant that nutmeg was more valuable than gold in general.</p>
      </div>
      <MCQ qKey="int4" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"Watch the geographic scope! The passage limits the high price specifically to \"London.\" The conclusion applies this \"in general\" (not just limited to London). At the source where it was grown, nutmeg was likely very cheap. You cannot apply a localised data point to the entire world."} />
    </div> },

    // Slide 6/12 — The Absolute Guarantee Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 6 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Absolute Guarantee Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Graduates with basic Python or SQL literacy are currently commanding starting salaries 10% higher than their non-technical peers.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> Learning to code guarantees a graduate a higher starting salary.</p>
      </div>
      <MCQ qKey="int5" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"The text describes a general trend across a population (\"are currently commanding\"). The conclusion uses the word \"guarantees,\" which implies zero exceptions. A graduate could learn Python and still fail a job interview, resulting in a salary of zero. Trends are not guarantees."} />
    </div> },

    // Slide 7/12 — The Rational Actor Principle (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 7 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Rational Actor Principle</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Global manufacturing firms saved billions with &lsquo;Just-in-Time&rsquo; inventory. However, following recent disruptions, 60% of these firms are pivoting to &lsquo;Just-in-Case&rsquo; models, willingly accepting much higher warehousing costs.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> For the majority of these firms, the financial impact of a supply chain disruption is calculated to be greater than the expense of extra storage.</p>
      </div>
      <MCQ qKey="int6" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"In Interpretation questions involving businesses, assume they act rationally. If a majority (60%) voluntarily accept a known high cost (warehousing), it is beyond a reasonable doubt that they are doing so to avoid an even larger cost (disruption)."} />
    </div> },

    // Slide 8/12 — The "Proof of Opposite" / Ignorance Trap (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 8 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The &ldquo;Proof of Opposite&rdquo; Trap</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Despite extensive testing over the last year by independent cybersecurity firms, no one has been able to prove that the bank&apos;s new encrypted database can be breached by external hackers.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> The bank&apos;s new encrypted database is immune to external hacking.</p>
      </div>
      <MCQ qKey="int7" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"Absence of evidence is not evidence of the opposite. Just because the testers haven't found a way to hack it yet, does not mean they have proven it cannot be hacked. It simply means a vulnerability remains undiscovered. Failing to prove \"Option A\" does not automatically prove \"Option B\"."} />
    </div> },

    // Slide 9/12 — Proof by Survival (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 9 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Proof by Survival</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> By 1860, the American South supplied 75% of the world&apos;s cotton to Britain. When the US Civil War blocked exports, British mills did not go bankrupt; they rapidly invested in India and Egypt.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> The British textile industry was not entirely dependent on the American South.</p>
      </div>
      <MCQ qKey="int8" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"This is \"Proof by Falsification.\" If the mills were entirely dependent, the loss of 75% of their supply would have destroyed them. Because they survived by pivoting to other countries, the dependency is proven to be flexible, not strict."} />
    </div> },

    // Slide 10/12 — The Inverse Logic Fallacy (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 10 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>The Inverse Logic Fallacy</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> In 1850, the whale oil industry collapsed not because of regulation, but because the discovery of petroleum provided a cheaper alternative.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> Since the industry collapsed after petroleum was discovered, stopping petroleum production today would restore the whale oil industry to its 1850 status.</p>
      </div>
      <MCQ qKey="int9" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[1]} expText={"Just because A caused B (petroleum caused the collapse), does not mean removing A reverses B (no petroleum = no collapse). Today, we have electricity, solar, and LED lights. Reversing the cause does not magically erase time and return things to their original state."} />
    </div> },

    // Slide 11/12 — Definitional Equivalence (Interactive)
    { render: () => <div>
      <span style={{ fontSize: 11, fontWeight: 700, color: itc, textTransform: "uppercase", letterSpacing: ".08em", padding: "3px 10px", borderRadius: 100, background: itc + "15", display: "inline-block", marginBottom: 16 }}>slide 11 of 12 — challenge</span>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Definitional Equivalence</h2>
      <div style={{ padding: 14, background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, marginBottom: 14 }}>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}><strong style={{ color: c.fg }}>Passage:</strong> Marcus commutes 90 minutes each way to his office in central London. Since his employer allowed two days of remote work (working from home) per week, Marcus reports feeling less fatigued on those days.</p>
        <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7, marginTop: 6 }}><strong style={{ color: c.fg }}>Proposed Conclusion:</strong> On the days Marcus works from home, he does not commute to central London.</p>
      </div>
      <MCQ qKey="int10" question="Does the conclusion follow?" opts={["Conclusion Follows", "Conclusion Does Not Follow"]} correctArr={[0]} expText={"Some conclusions follow simply by definition. The definition of \"working from home\" is performing your duties at your residence instead of travelling to the office. The states are mutually exclusive."} />
    </div> },

    // Slide 12/12 — Cheat Sheet
    { render: () => <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Interpretations Cheat Sheet</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { rule: "Reasonable Doubt", tip: "Not hyper-paranoid strict logic — would a reasonable person accept it?" },
          { rule: "Correlation ≠ Causation", tip: "\"Coincided\" or \"alongside\" does not mean one caused the other." },
          { rule: "Overlapping Sets", tip: "If two percentages from the same group exceed 100%, overlap is forced." },
          { rule: "Scope Shift", tip: "A conclusion that widens the passage's scope (local → global) Does Not Follow." },
          { rule: "Trends ≠ Guarantees", tip: "\"Generally\" or \"on average\" does not mean 100% of the time." },
          { rule: "Rational Actors", tip: "Assume businesses/people act in their own rational interest." },
          { rule: "Absence ≠ Proof", tip: "Failing to prove X does not prove the opposite of X." },
          { rule: "Proof by Survival", tip: "If something survives the removal of a factor, it wasn't entirely dependent on it." },
          { rule: "Inverse Fallacy", tip: "Removing a cause does not reverse its effect — time moves forward." },
          { rule: "Definitions", tip: "Some conclusions follow purely from the meaning of the words used." },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "155px 1fr", padding: "11px 14px", background: c.mtBg, borderRadius: 10, border: "1px solid " + c.bd, alignItems: "start", gap: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: itc, fontFamily: fonts.m }}>{r.rule}</span>
            <span style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.55 }}>{r.tip}</span>
          </div>
        ))}
      </div>
    </div> },
  ];

  // ============================================================================
  // LESSON VIEW
  // ============================================================================
  const slideMap: Record<string, { render: () => JSX.Element }[]> = {
    "Ergo Fundamentals": fundamentalsSlides,
    "Logic Essentials": logicSlides,
    "Inference": inferenceSlides,
    "Assumptions": assumptionSlides,
    "Deduction": deductionSlides,
    "Interpretation": interpretationSlides,
    "Arguments": argSlides,
  };
  const allSlides = sel ? (slideMap[sel] || logicSlides) : logicSlides;

  if (started && sel) {
    const slides = allSlides;
    const info = secInfo[sel];
    const go = (dir: number) => { setSE(false); setSI(false); setSlide((p) => p + dir); };
    const exitLearn = () => { setEC(false); setStarted(false); setSlide(0); setSE(false); setAns({}); };

    return (
      <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
        <Hdr
          left={
            <>
              <Btn v="ghost" sz="sm" onClick={() => (slide > 0 ? setEC(true) : exitLearn())}>← Back</Btn>
              <span style={{ fontWeight: 600, fontSize: 14.5, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: info.color, display: "flex" }}>{info.icon}</span> {sel}</span>
            </>
          }
          right={<ThemeToggle />}
        />
        <Ctn style={{ padding: "44px 28px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {slides.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <PB value={((slide + 1) / slides.length) * 100} color={info.color} height={5} />
                <Mono style={{ fontSize: 12, color: c.mt, flexShrink: 0 }}>{slide + 1}/{slides.length}</Mono>
              </div>
            )}
            <Card key={slide} style={{ padding: 32, animation: "fu .35s ease both", minHeight: 260 }}>
              {slides[slide].render()}
            </Card>
            {slides.length > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, gap: 12 }}>
                <Btn v="outline" disabled={slide === 0} onClick={() => go(-1)} style={{ flex: 1 }}>Previous</Btn>
                {slide < slides.length - 1
                  ? <Btn onClick={() => go(1)} style={{ flex: 1 }}>Next</Btn>
                  : <Btn onClick={() => router.push(hasAcc ? "/practice" : "/pricing")} style={{ flex: 1 }}>{hasAcc ? "Start Practising " + sel : "Unlock Practice Mode"}</Btn>}
              </div>
            )}
            {slides.length > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 18 }}>
                {slides.map((_, i) => (
                  <div key={i} style={{
                    width: i === slide ? 20 : 7, height: 7, borderRadius: 4,
                    background: i <= slide ? info.color : c.bd, transition: "all .3s", cursor: "pointer",
                  }} onClick={() => { setSE(false); setSlide(i); }} />
                ))}
              </div>
            )}
          </div>
        </Ctn>
        <ConfirmModal open={exitConfirm} title="Exit lesson?" body="Your progress in this lesson will not be saved." confirmText="Exit" cancelText="Keep learning" onConfirm={exitLearn} onCancel={() => setEC(false)} />
      </div>
    );
  }

  // ============================================================================
  // SECTION PICKER VIEW
  // ============================================================================
  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={
          <>
            <Btn v="ghost" sz="sm" onClick={() => router.push("/dashboard")}>← Back</Btn>
            <span style={{ fontWeight: 600, fontSize: 14.5, display: "inline-flex", alignItems: "center", gap: 6 }}><BookOpen size={18} color={"#6366F1"} /> Learning Mode</span>
          </>
        }
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "44px 28px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <Card className="s1" style={{ marginBottom: 22, background: theme === "dark" ? c.card : "#3B82F606", border: "1px solid #3B82F620" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 5, fontSize: 14.5 }}>About Learning Mode</h3>
            <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}>Pick a section to study. Each module is a short guided lesson covering the key concepts, common traps, and interactive exercises.</p>
          </Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: c.mt, textTransform: "uppercase", letterSpacing: ".08em" }}>Choose a section</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {LEARN_SECTIONS.map((s) => {
              const info = secInfo[s];
              const isSel = sel === s;
              return (
                <button key={s} onClick={() => setSel(s)} style={{
                  padding: "18px 20px", background: isSel ? info.color + "0C" : c.card,
                  border: "1.5px solid " + (isSel ? info.color : c.bd), borderRadius: 14,
                  cursor: "pointer", transition: "all .25s", textAlign: "left", fontFamily: fonts.b,
                  display: "flex", alignItems: "center", gap: 14, color: c.fg,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: info.color + "15",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: info.color,
                  }}>{info.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{s}</h4>
                      {!info.ready && <span style={{ fontSize: 10, fontWeight: 700, color: c.mt, textTransform: "uppercase", letterSpacing: ".06em", padding: "2px 8px", borderRadius: 100, background: c.mtBg }}>Coming soon</span>}
                    </div>
                    <p style={{ fontSize: 12.5, color: c.fgS, lineHeight: 1.5 }}>{info.desc}</p>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", border: "2px solid " + (isSel ? info.color : c.bd),
                    background: isSel ? info.color : "transparent", display: "flex", alignItems: "center",
                    justifyContent: "center", transition: "all .2s", flexShrink: 0,
                  }}>
                    {isSel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                </button>
              );
            })}
          </div>
          <Btn full sz="lg" disabled={!sel || !hasAcc} onClick={() => { setSlide(0); setSE(false); setAns({}); setStarted(true); }}>
            {sel ? "Begin: " + sel : "Select a section to continue"}
          </Btn>
          {!hasAcc && (
            <div style={{ marginTop: 16, padding: "14px 18px", background: theme === "dark" ? c.card : "#F59E0B08", border: "1px solid #F59E0B30", borderRadius: 12, textAlign: "center" }}>
              <p style={{ fontSize: 13.5, color: c.fgS, lineHeight: 1.7 }}>
                Enter your university society code on your{" "}
                <a href="/profile" style={{ color: c.ac, fontWeight: 600, textDecoration: "underline" }}>profile page</a>
                {" "}to unlock Learning Mode, or grab an{" "}
                <a href="/pricing" style={{ color: c.ac, fontWeight: 600, textDecoration: "underline" }}>access pass</a>.
              </p>
            </div>
          )}
        </div>
      </Ctn>
    </div>
  );
}
