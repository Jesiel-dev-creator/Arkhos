export default function Terms() {
  const pageStyle: React.CSSProperties = {
    maxWidth: "48rem",
    margin: "0 auto",
    padding: "4rem 1.5rem",
    color: "var(--muted)",
    fontFamily: "var(--font-body)",
  };

  const h1Style: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "2.25rem",
    color: "var(--frost)",
    marginBottom: "0.5rem",
  };

  const h2Style: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "1.25rem",
    color: "var(--frost)",
    marginTop: "2rem",
    marginBottom: "0.75rem",
  };

  const pStyle: React.CSSProperties = {
    lineHeight: "1.75",
    marginBottom: "1rem",
  };

  const ulStyle: React.CSSProperties = {
    paddingLeft: "1.5rem",
    lineHeight: "1.75",
    marginBottom: "1rem",
  };

  const hrStyle: React.CSSProperties = {
    borderColor: "var(--border)",
    borderTopWidth: "1px",
    margin: "2rem 0",
  };

  const subtitleStyle: React.CSSProperties = {
    color: "var(--muted)",
    fontSize: "0.875rem",
    marginBottom: "2rem",
  };

  return (
    <div style={pageStyle}>
      <h1 style={h1Style}>Terms of Service</h1>
      <p style={subtitleStyle}>Last updated: March 30, 2026</p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>1. Introduction</h2>
      <p style={pStyle}>
        These Terms of Service ("Terms") govern your use of ArkhosAI (the "Service"), an AI-powered website generator operated by{" "}
        <strong style={{ color: "var(--frost)" }}>Bleucommerce SAS</strong>, a French simplified joint-stock company (Société par actions simplifiée à associé unique), registered at 60 rue François 1er, 75008 Paris, France (SIRET 942 662 552, RCS Paris).
      </p>
      <p style={pStyle}>
        By using ArkhosAI, you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>2. Description of Service</h2>
      <p style={pStyle}>
        ArkhosAI is an AI website generator. You submit a natural language description of a website, and a pipeline of AI agents (Planner, Designer, Builder, Reviewer) generates a complete HTML/CSS/JavaScript file that you can download and self-host.
      </p>
      <p style={pStyle}>
        The Service is provided in two tiers:
      </p>
      <ul style={ulStyle}>
        <li><strong style={{ color: "var(--frost)" }}>Free tier:</strong> 3 generations per IP address per day, subject to fair use. No account required. No guarantees of uptime, availability, or output quality.</li>
        <li><strong style={{ color: "var(--frost)" }}>Future paid tiers:</strong> Higher limits and additional features will be offered under separate pricing terms when available.</li>
      </ul>

      <hr style={hrStyle} />

      <h2 style={h2Style}>3. Ownership of Generated Content</h2>
      <p style={pStyle}>
        You own the code generated for you. Subject to these Terms, Bleucommerce SAS assigns to you all rights, title, and interest in the HTML, CSS, and JavaScript output produced from your prompt. You are free to use, modify, publish, sell, or distribute the generated code without restriction or attribution.
      </p>
      <p style={pStyle}>
        Bleucommerce SAS retains no rights over your generated output and does not claim any licence over it. The generated code is not used to train AI models.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>4. Acceptable Use</h2>
      <p style={pStyle}>
        You agree not to use ArkhosAI to generate content that:
      </p>
      <ul style={ulStyle}>
        <li>Is illegal under French, EU, or applicable international law;</li>
        <li>Infringes the intellectual property rights of any third party;</li>
        <li>Constitutes hate speech, harassment, or incitement to violence;</li>
        <li>Is designed to deceive users (phishing, scam pages, fake login forms);</li>
        <li>Contains malware, spyware, or malicious code;</li>
        <li>Violates the privacy of any individual;</li>
        <li>Promotes illegal products or services.</li>
      </ul>
      <p style={pStyle}>
        We reserve the right to suspend access, without notice, for any use that violates these restrictions or that we determine, in our sole discretion, to be harmful to users, third parties, or the integrity of the Service.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>5. Rate Limits and Fair Use</h2>
      <p style={pStyle}>
        The free tier is limited to 3 generations per IP address per 24-hour period. Circumventing rate limits by proxying, rotating IPs, or other technical means is prohibited and may result in a permanent ban.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>6. Disclaimer of Warranties</h2>
      <p style={pStyle}>
        THE SERVICE IS PROVIDED <strong style={{ color: "var(--frost)" }}>"AS IS"</strong> AND{" "}
        <strong style={{ color: "var(--frost)" }}>"AS AVAILABLE"</strong> WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
      </p>
      <p style={pStyle}>
        We do not warrant that:
      </p>
      <ul style={ulStyle}>
        <li>The Service will be uninterrupted, error-free, or available at any particular time;</li>
        <li>AI-generated output will be accurate, complete, suitable for any specific purpose, or free from defects;</li>
        <li>Generated code will be compatible with any particular browser, device, or hosting environment.</li>
      </ul>
      <p style={pStyle}>
        You are responsible for reviewing and testing generated code before deploying it in any production environment.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>7. Limitation of Liability</h2>
      <p style={pStyle}>
        To the maximum extent permitted by applicable law, Bleucommerce SAS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, loss of revenue, or damage to reputation.
      </p>
      <p style={pStyle}>
        Our total aggregate liability to you for any claim arising from or related to the Service shall not exceed the total amount you have paid to Bleucommerce SAS in the twelve months preceding the claim (which for free tier users is zero).
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>8. Modifications to the Service</h2>
      <p style={pStyle}>
        We reserve the right to modify, suspend, or discontinue any part of the Service at any time without notice. We will not be liable to you or any third party for any such modification, suspension, or discontinuation.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>9. Governing Law and Jurisdiction</h2>
      <p style={pStyle}>
        These Terms are governed by and construed in accordance with the laws of{" "}
        <strong style={{ color: "var(--frost)" }}>France</strong>, without regard to its conflict of law provisions. The EU's AI Act (Regulation (EU) 2024/1689) applies where relevant.
      </p>
      <p style={pStyle}>
        Any dispute arising from or relating to these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the{" "}
        <strong style={{ color: "var(--frost)" }}>Courts of Paris (Tribunaux de Paris)</strong>, unless mandatory consumer protection law in your country of residence provides otherwise.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>10. Changes to These Terms</h2>
      <p style={pStyle}>
        We may update these Terms from time to time. Material changes will be posted on this page with an updated date. Continued use of the Service after such changes constitutes acceptance of the new Terms.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>11. Contact</h2>
      <p style={pStyle}>
        For questions about these Terms:<br />
        <a href="mailto:contact@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>contact@bleucommerce.fr</a><br />
        Bleucommerce SAS — 60 rue François 1er, 75008 Paris, France
      </p>
    </div>
  );
}
