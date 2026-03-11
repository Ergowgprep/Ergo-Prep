"use client";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Ctn, Hdr, Ftr, ThemeToggle } from "@/components/ui";

export default function PrivacyPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = getColors(theme === "dark");

  const sH = { fontFamily: fonts.d, fontSize: 22, fontStyle: "italic" as const, marginTop: 38, marginBottom: 14, color: c.fg };
  const sS = { fontWeight: 700 as const, marginTop: 20, marginBottom: 6, color: c.fg, fontSize: 15 };
  const sP = { marginBottom: 14 };
  const sU = { paddingLeft: 24, marginBottom: 14, listStyleType: "disc" as const };
  const sL = { marginBottom: 8 };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.fg, fontFamily: fonts.b, transition: "background .4s, color .4s" }}>
      <Hdr
        left={<Btn v="ghost" sz="sm" onClick={() => router.push("/")}>← Back</Btn>}
        right={<ThemeToggle />}
      />
      <Ctn style={{ padding: "60px 28px", maxWidth: 640 }}>
        <h1 className="s1" style={{ fontFamily: fonts.d, fontSize: 34, fontStyle: "italic", marginBottom: 8 }}>Privacy Policy</h1>
        <div className="s2" style={{ color: c.fgS, lineHeight: 1.9, fontSize: 14.5 }}>
          <p style={{ marginBottom: 22, fontSize: 13, color: c.mt }}>Last Updated: 28 February 2026</p>

          <p style={sP}>
            Ergo Prep Ltd (&ldquo;Ergo&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed
            to protecting your privacy and practising strict data minimisation. This Privacy Policy explains how we
            collect, use, and protect your personal data when you use our website and services (collectively, the
            &ldquo;Service&rdquo;).
          </p>

          <p style={sP}>
            By accessing or using the Service, you agree to the collection and use of information in accordance with
            this policy.
          </p>

          {/* 1. WHO WE ARE */}
          <h2 style={sH}>1. Who We Are (Data Controller)</h2>

          <p style={sP}>
            For the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018,
            the Data Controller is:
          </p>
          <p style={sP}>
            Ergo Prep Ltd<br />
            Email:{" "}
            <a href="mailto:ergoprepuk@gmail.com" style={{ color: c.ac, textDecoration: "underline" }}>
              ergoprepuk@gmail.com
            </a>
            <br />
            Registered Office: Office 17719, 182-184 High Street North, East Ham, London, E6 2JA.
          </p>

          {/* 2. THE DATA WE COLLECT */}
          <h2 style={sH}>2. The Data We Collect</h2>

          <p style={sP}>
            We only collect the data strictly necessary to operate our testing platform, process your payments, and
            secure our intellectual property.
          </p>

          <p style={sS}>2.1. Information You Provide</p>
          <ul style={sU}>
            <li style={sL}>
              <strong>Account Data:</strong> When you sign up, we collect your name and email address (via dedicated
              email sign-up or Google/LinkedIn authentication).
            </li>
            <li style={sL}>
              <strong>Educational Data:</strong> We collect information regarding your university and year of study via
              a short onboarding questionnaire.
            </li>
          </ul>

          <p style={sS}>2.2. Information We Collect Automatically</p>
          <ul style={sU}>
            <li style={sL}>
              <strong>&ldquo;Smart Detect&rdquo; Verification:</strong> We utilise a script that identifies your
              university affiliation based on your email domain (e.g., @ucl.ac.uk).
            </li>
            <li style={sL}>
              <strong>Performance Tracking:</strong> Every answer you submit is logged to track your performance,
              recording the specific question ID, whether it was correct, and the time taken.
            </li>
            <li style={sL}>
              <strong>Technical &amp; Security Data:</strong> To protect our platform from automated scraping and
              credential sharing, we log your IP address, browser type, and device information.
            </li>
          </ul>

          <p style={sS}>2.3. Financial Data</p>
          <p style={sP}>
            We do not store your credit card details or physical addresses. All financial transactions are tokenised
            and processed securely via Stripe. We only receive a webhook confirmation of a successful transaction to
            grant you access.
          </p>

          {/* 3. HOW WE USE YOUR DATA */}
          <h2 style={sH}>3. How We Use Your Data</h2>

          <p style={sP}>We process your personal data under the following lawful bases:</p>
          <ul style={sU}>
            <li style={sL}>
              <strong>To Provide the Service (Contract):</strong> We use your identity and performance data to grant
              you timed access, score your practice tests, and manage your account.
            </li>
            <li style={sL}>
              <strong>To Prevent Fraud &amp; Scraping (Legitimate Interest):</strong> We use Technical Data and session
              monitoring to detect concurrent logins from different geographic locations or devices. If detected,
              sessions are invalidated to prevent credential sharing. We also use IP-based rate limiting to block
              automated bots attempting to download our question bank.
            </li>
          </ul>

          {/* 4. DATA SHARING & THIRD PARTIES */}
          <h2 style={sH}>4. Data Sharing &amp; Third Parties</h2>

          <p style={sP}>
            We do not sell, rent, or share your personal data, contact information, or test performance with
            third-party recruiters, employers, universities, or marketing agencies.
          </p>

          <p style={sP}>
            We only share data with essential, highly secure infrastructure providers required to run the Service:
          </p>
          <ul style={sU}>
            <li style={sL}><strong>Stripe:</strong> For secure payment processing and subscription management.</li>
            <li style={sL}><strong>Supabase:</strong> For our backend database and authentication logging.</li>
            <li style={sL}><strong>Vercel:</strong> For secure hosting and server infrastructure.</li>
            <li style={sL}><strong>NextAuth:</strong> For secure account authentication via Google and LinkedIn.</li>
          </ul>

          {/* 5. DATA SECURITY */}
          <h2 style={sH}>5. Data Security</h2>

          <p style={sP}>
            We employ strict, enterprise-grade security measures to protect your data and our intellectual property,
            including:
          </p>
          <ul style={sU}>
            <li style={sL}>
              <strong>Row Level Security (RLS):</strong> Database policies that mathematically prevent users from
              querying any data that isn&rsquo;t their own account info or the single active question they are viewing.
            </li>
            <li style={sL}>
              <strong>Session Integrity Limits:</strong> Automatic session termination if system time discrepancies or
              concurrent logins are detected.
            </li>
          </ul>

          {/* 6. INTERNATIONAL DATA TRANSFERS */}
          <h2 style={sH}>6. International Data Transfers</h2>

          <p style={sP}>
            Some of our service providers (e.g., Stripe, Vercel, Supabase) may process data outside the UK/EEA.
            Whenever we transfer your data internationally, we ensure it is protected by appropriate safeguards, such
            as UK International Data Transfer Agreements (IDTAs), Standard Contractual Clauses (SCCs), or the
            UK-US Data Bridge.
          </p>

          {/* 7. DATA RETENTION */}
          <h2 style={sH}>7. Data Retention</h2>

          <ul style={sU}>
            <li style={sL}>
              <strong>Account &amp; Performance Data:</strong> Retained for as long as your account remains active so
              you can track your progress. If you request account deletion, your personal identifiers will be
              permanently erased within 30 days.
            </li>
            <li style={sL}>
              <strong>Financial Records:</strong> Basic transaction history (excluding card details) is retained for 6
              years as required by UK tax law (HMRC).
            </li>
          </ul>

          {/* 8. YOUR LEGAL RIGHTS */}
          <h2 style={sH}>8. Your Legal Rights</h2>

          <p style={sP}>Under the UK GDPR, you have the right to:</p>
          <ul style={sU}>
            <li style={sL}><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li style={sL}><strong>Correction:</strong> Ask us to fix inaccurate information.</li>
            <li style={sL}><strong>Erasure:</strong> Ask us to delete your data (the &ldquo;right to be forgotten&rdquo;).</li>
            <li style={sL}>
              <strong>Restriction/Objection:</strong> Object to or restrict us from processing your data in certain ways.
            </li>
          </ul>

          <p style={sP}>
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:ergoprepuk@gmail.com" style={{ color: c.ac, textDecoration: "underline" }}>
              ergoprepuk@gmail.com
            </a>
          </p>

          {/* 9. COOKIES & TRACKING */}
          <h2 style={sH}>9. Cookies &amp; Tracking</h2>

          <p style={sP}>
            We use strictly necessary cookies (such as NextAuth session tokens) required to keep you securely logged
            in and to enforce our anti-sharing security measures. Because we do not use third-party advertising or
            invasive tracking cookies, your experience remains private.
          </p>

          {/* 10. CHANGES TO THIS POLICY */}
          <h2 style={sH}>10. Changes to This Policy</h2>

          <p style={sP}>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you via
            email or a prominent notice on the Site prior to the change taking effect.
          </p>
        </div>
      </Ctn>
      <Ftr />
    </div>
  );
}
