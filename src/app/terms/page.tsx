"use client";
import { useRouter } from "next/navigation";
import { getColors, fonts } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";
import { Btn, Ctn, Hdr, Ftr, ThemeToggle } from "@/components/ui";

export default function TermsPage() {
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
        <h1 className="s1" style={{ fontFamily: fonts.d, fontSize: 34, fontStyle: "italic", marginBottom: 8 }}>Terms of Service</h1>
        <div className="s2" style={{ color: c.fgS, lineHeight: 1.9, fontSize: 14.5 }}>
          <p style={{ marginBottom: 22, fontSize: 13, color: c.mt }}>Last Updated: 28 February 2026</p>

          <p style={{ ...sP, fontWeight: 700, color: c.fg }}>
            PLEASE READ THESE TERMS CAREFULLY BEFORE USING THIS SITE
          </p>

          <p style={sP}>
            These Terms of Service (these &ldquo;Terms&rdquo;) constitute a legally binding agreement between you
            (&ldquo;User&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) and Ergo Prep Ltd (&ldquo;Ergo&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), a company registered in England and Wales
            under company number 17061272. Our registered office is at Office 17719, 182-184 High Street North,
            East Ham, London, E6 2JA.
          </p>

          <p style={sP}>
            By creating an account, purchasing a Timed Access Pass, or otherwise accessing our website
            (the &ldquo;Site&rdquo;), you agree to be bound by these Terms and our Privacy Policy.
          </p>

          <p style={{ ...sP, fontWeight: 700, color: c.fg }}>
            IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT ACCESS OR USE THE SERVICE.
          </p>

          {/* 1. THE SERVICE */}
          <h2 style={sH}>1. The Service</h2>

          <p style={sS}>1.1. Definition</p>
          <p style={sP}>
            Ergo provides a web-based test preparation platform designed to help students prepare for Watson
            Glaser-style critical thinking tests through a proprietary question bank and analytics tools
            (collectively, the &ldquo;Service&rdquo;).
          </p>

          <p style={sS}>1.2. Beta Phase Disclaimer</p>
          <p style={sP}>
            You acknowledge that the Service is currently in a &ldquo;Beta&rdquo; phase. While we aim to provide
            a library of over 1,500 questions, the active database may currently contain fewer (approximately 1,460)
            as we finalise content uploads. You agree that this temporary discrepancy does not constitute a defect
            or a failure to deliver the Service.
          </p>

          <p style={sS}>1.3. No Guarantee of Results</p>
          <p style={sP}>
            The Service is strictly a practice tool. We do not guarantee that using the Service will result in a
            specific score on any real-world assessment, a job offer, or any other professional outcome.
          </p>

          <p style={sS}>1.4. Independence &amp; Non-Affiliation</p>
          <p style={sP}>
            The Service is an independent educational tool created by Ergo. It is not affiliated with, endorsed by,
            or connected to the owners of the Watson Glaser Critical Thinking Appraisal&trade; or any other official
            test publisher. The questions provided are originally authored by Ergo for practice purposes to develop
            critical thinking skills; they are not real questions from any official examination.
          </p>

          {/* 2. ACCOUNTS & ACCESS */}
          <h2 style={sH}>2. Accounts &amp; Access</h2>

          <p style={sS}>2.1. Registration</p>
          <p style={sP}>
            To access the Service, you must register an account using a valid email address (or via Google or
            LinkedIn authentication).
          </p>

          <p style={sS}>2.2. Timed Access Passes</p>
          <p style={sP}>
            We offer fee-based access to the Service for specific durations (e.g., 6 hours, 24 hours, 1 week)
            (&ldquo;Timed Access Pass&rdquo;).
          </p>
          <ul style={sU}>
            <li style={sL}><strong>Activation:</strong> Your access timer begins immediately upon payment confirmation.</li>
            <li style={sL}><strong>Expiration:</strong> Access terminates automatically when your purchased time elapses.</li>
            <li style={sL}><strong>No Pausing:</strong> You cannot &ldquo;pause&rdquo; or suspend a timer once it has started.</li>
          </ul>

          <p style={sS}>2.3. Strict No-Sharing Policy</p>
          <p style={sP}>
            Your account is for your personal, non-commercial use only.
          </p>
          <ul style={sU}>
            <li style={sL}>
              <strong>Concurrent Sessions:</strong> Our system monitors for concurrent logins. If your account is
              accessed from two different geographic locations or devices simultaneously, we reserve the right to
              immediately invalidate your session and permanently suspend your account without refund.
            </li>
            <li style={sL}>
              <strong>Credential Protection:</strong> You are responsible for maintaining the confidentiality of
              your login credentials. You may not sell, transfer, or lend your account to any third party.
            </li>
            <li style={sL}>
              <strong>Abnormal Usage Patterns:</strong> You agree that your use of the Service will not exceed the
              usage levels reasonably expected of a single human user. We reserve the right to suspend any account
              that exhibits abnormal activity (e.g., accessing questions at a speed or volume that suggests automated
              scraping or bulk downloading), even if accessed from a single device.
            </li>
            <li style={sL}>
              <strong>Institutional &amp; Public Use:</strong> You are strictly prohibited from using the Service for
              commercial training, classroom instruction, university society events, or content creation (including
              but not limited to YouTube videos or social media streams) without our prior written consent.
            </li>
            <li style={sL}>
              <strong>Commercial Inquiries:</strong> If you represent a university, society, or training organisation
              and wish to use Ergo for your students or members, please contact us at{" "}
              <a href="mailto:ergoprepuk@gmail.com" style={{ color: c.ac, textDecoration: "underline" }}>
                ergoprepuk@gmail.com
              </a>{" "}
              to discuss a commercial license or group partnership.
            </li>
          </ul>

          {/* 3. PAYMENT & REFUNDS */}
          <h2 style={sH}>3. Payment &amp; Refunds</h2>

          <p style={sS}>3.1. Payment Processing</p>
          <p style={sP}>
            Payments are processed securely via our third-party payment processor, Stripe. We do not store your
            credit card details or financial information.
          </p>

          <p style={sS}>3.2. Waiver of Withdrawal Rights (Digital Content)</p>
          <p style={sP}>
            By purchasing a Timed Access Pass, you expressly request that the supply of the digital content begins
            immediately. You acknowledge and agree that you lose your right of withdrawal (the statutory 14-day
            &ldquo;cooling-off&rdquo; period) once the access to the content has been granted, in accordance with the
            Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013.
          </p>

          <p style={sS}>3.3. Refunds</p>
          <p style={sP}>
            All sales are final. Refunds are generally not provided unless there is a verifiable technical fault
            with the Service that prevents access and which we are unable to resolve.
          </p>

          <p style={sS}>3.4. Discretionary Financial Aid (&ldquo;Ergo Mission&rdquo;)</p>
          <p style={sP}>
            Ergo reserves the right to grant complimentary access to users who demonstrate financial need. This is a
            discretionary gift, not a contractual entitlement. We reserve the right to accept or decline any request
            for free access for any reason, without obligation to provide a justification.
          </p>

          {/* 4. INTELLECTUAL PROPERTY RIGHTS */}
          <h2 style={sH}>4. Intellectual Property Rights</h2>

          <p style={sS}>4.1. Ownership</p>
          <p style={sP}>
            The content on the Site, including but not limited to text, questions, logic, passages, reasonings,
            algorithms, software code, and design (the &ldquo;Content&rdquo;), is the exclusive property of Ergo
            and is protected by copyright, trademark, and other intellectual property laws.
          </p>

          <p style={sS}>4.2. Prohibited Uses (Anti-Scraping &amp; AI)</p>
          <p style={sP}>You expressly agree NOT to:</p>
          <ul style={sU}>
            <li style={sL}>
              <strong>Scrape or Copy:</strong> Use any robot, spider, scraper, script, browser extension, or other
              automated means to access the Service or copy any Content.
            </li>
            <li style={sL}>
              <strong>AI Training:</strong> Use any Content to train, fine-tune, or test any Artificial Intelligence,
              Large Language Model (LLM), or machine learning algorithm.
            </li>
            <li style={sL}>
              <strong>Competitor Analysis:</strong> Access the Service for the purpose of monitoring availability,
              performance, or functionality, or for any other benchmarking or competitive purpose.
            </li>
            <li style={sL}>
              <strong>Reverse Engineer:</strong> Attempt to decipher, decompile, disassemble, or reverse engineer
              any of the software used to provide the Service.
            </li>
          </ul>

          <p style={sS}>4.3. Enforcement</p>
          <p style={sP}>
            Violation of this Section 4 causes significant and irreparable harm to Ergo. We reserve the right to
            seek injunctive relief and claim damages to the fullest extent of the law against any User found
            violating these provisions.
          </p>

          <p style={sS}>4.4. Content Disclaimer: Fictional &amp; Hypothetical Scenarios</p>
          <p style={sP}>
            The Service is a critical thinking assessment tool, not a news outlet or history textbook. You
            acknowledge the following regarding the Content:
          </p>
          <ul style={sU}>
            <li style={sL}>
              <strong>(a) Fictitious Characters:</strong> Many scenarios involve purely fictitious names, businesses,
              and events. Any resemblance to actual persons (living or dead) in these specific instances is purely
              coincidental.
            </li>
            <li style={sL}>
              <strong>(b) Real Entities in Hypothetical Contexts:</strong> The Service frequently references real
              organisations (e.g., the FCA, SRA, NHS), public figures, and government bodies to construct realistic
              logic puzzles. You acknowledge that the specific actions, statements, or policies attributed to these
              entities within the questions are often hypothetical premises invented solely to test logic. They should
              not be interpreted as factual reports, news, or a reflection of the actual conduct of those entities.
            </li>
            <li style={sL}>
              <strong>(c) Historical &amp; Scientific Accuracy:</strong> References to historical events, scientific
              facts, or philosophical texts may be simplified, selectively edited, or intentionally altered to create
              a specific logical ambiguity. The Content should not be relied upon as an authoritative educational source.
            </li>
          </ul>

          {/* 5. USER DATA */}
          <h2 style={sH}>5. User Data</h2>

          <p style={sS}>5.1. Data Minimisation</p>
          <p style={sP}>
            Ergo respects your privacy and operates on a principle of data minimisation. We collect and store only
            the data strictly necessary to provide the Service, authenticate your account, process your access pass,
            and maintain platform security (including preventing unauthorised account sharing or scraping).
          </p>

          <p style={sS}>5.2. No Third-Party Selling</p>
          <p style={sP}>
            We do not sell, rent, or share your personal data, performance metrics, or &ldquo;Logic Profile&rdquo;
            with third-party recruiters, employers, or marketing agencies. Your test performance is strictly for your
            own personal development. For full details on how we handle your data, please review our Privacy Policy.
          </p>

          {/* 6. LIMITATION OF LIABILITY */}
          <h2 style={sH}>6. Limitation of Liability</h2>

          <p style={sS}>6.1. Non-Excludable Liability</p>
          <p style={sP}>
            Nothing in these Terms limits or excludes our liability for: (a) death or personal injury caused by our
            negligence; (b) fraud or fraudulent misrepresentation; or (c) any other liability that cannot be excluded
            or limited by English law.
          </p>

          <p style={sS}>6.2. Statutory Rights</p>
          <p style={sP}>
            As a consumer, you have certain legal rights (including that the digital content must be of satisfactory
            quality, fit for purpose, and as described) which cannot be excluded or limited by these Terms. The
            exclusions and limitations of liability in this Section 6 apply only to the extent permitted by law and
            do not affect your statutory rights.
          </p>

          <p style={sS}>6.3. &ldquo;As Is&rdquo; and &ldquo;As Available&rdquo;</p>
          <p style={sP}>
            Subject to Sections 6.1 and 6.2, the Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS
            AVAILABLE&rdquo; basis. We expressly disclaim all warranties, conditions, and representations of any kind,
            whether express or implied, including but not limited to the implied warranties of merchantability, fitness
            for a particular purpose, and non-infringement. We do not guarantee that the Service will be uninterrupted,
            secure, or free from errors, bugs, or viruses.
          </p>

          <p style={sS}>6.4. Exclusion of Certain Damages</p>
          <p style={sP}>
            Subject to Section 6.1, Ergo Prep Ltd (including its directors, employees, agents, and suppliers) shall
            not be liable to you, whether in contract, tort (including negligence), breach of statutory duty, or
            otherwise, for any: (a) loss of profit, business, goodwill, reputation, or revenue; (b) loss or corruption
            of data; or (c) indirect, incidental, special, consequential, or punitive damages, arising out of or in
            connection with these Terms or your use (or inability to use) the Service, even if we have been advised
            of the possibility of such damages.
          </p>

          <p style={sS}>6.5. Liability Cap</p>
          <p style={sP}>
            Subject to Section 6.1, our total aggregate liability to you for all claims arising out of or relating to
            these Terms or the Service (whether in contract, tort, negligence, or otherwise) shall be limited to the
            greater of: (a) the total amount you paid to Ergo Prep Ltd in the twelve (12) months immediately preceding
            the event giving rise to the claim; or (b) &pound;100.
          </p>

          <p style={sS}>6.6. Events Outside Our Control</p>
          <p style={sP}>
            We will not be liable or responsible for any failure to perform, or delay in performance of, any of our
            obligations under these Terms that is caused by any act or event beyond our reasonable control (a &ldquo;Force
            Majeure Event&rdquo;), including but not limited to failure of public or private telecommunications networks.
          </p>

          {/* 7. TERMINATION */}
          <h2 style={sH}>7. Termination</h2>

          <p style={sP}>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or
            liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon
            termination, your right to use the Service will cease immediately.
          </p>

          {/* 8. GENERAL PROVISIONS */}
          <h2 style={sH}>8. General Provisions</h2>

          <p style={sS}>8.1. Governing Law</p>
          <p style={sP}>
            These Terms shall be governed by and construed in accordance with the laws of England and Wales. You agree
            to submit to the exclusive jurisdiction of the courts of England and Wales.
          </p>

          <p style={sS}>8.2. Severability</p>
          <p style={sP}>
            If any provision of these Terms is held to be invalid or unenforceable, such provision will be limited or
            eliminated to the minimum extent necessary, and the remaining provisions of these Terms will remain in full
            force and effect.
          </p>

          <p style={sS}>8.3. Entire Agreement</p>
          <p style={sP}>
            These Terms and our Privacy Policy constitute the entire agreement between you and Ergo regarding the
            Service and supersede all prior and contemporaneous written or oral agreements between you and Ergo.
          </p>

          <p style={sS}>8.4. Changes to Terms</p>
          <p style={sP}>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try
            to provide at least 30 days&rsquo; notice prior to any new terms taking effect. By continuing to access or
            use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>

          {/* CONTACT US */}
          <h2 style={sH}>Contact Us</h2>

          <p style={sP}>
            If you have any questions about these Terms, please contact us at{" "}
            <a href="mailto:ergoprepuk@gmail.com" style={{ color: c.ac, textDecoration: "underline" }}>
              ergoprepuk@gmail.com
            </a>
          </p>
        </div>
      </Ctn>
      <Ftr />
    </div>
  );
}
