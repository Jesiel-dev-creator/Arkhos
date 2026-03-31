export default function Privacy() {
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
      <h1 style={h1Style}>Privacy Policy</h1>
      <p style={subtitleStyle}>Last updated: March 30, 2026</p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>1. Data Controller</h2>
      <p style={pStyle}>
        The data controller for ArkhosAI is:
      </p>
      <p style={pStyle}>
        <strong style={{ color: "var(--frost)" }}>Bleucommerce SAS</strong><br />
        60 rue François 1er, 75008 Paris, France<br />
        SIRET: 942 662 552 (RCS Paris)<br />
        Email: <a href="mailto:privacy@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>privacy@bleucommerce.fr</a>
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>2. Data We Collect</h2>
      <p style={pStyle}>
        When you use ArkhosAI, we collect the following data:
      </p>
      <ul style={ulStyle}>
        <li><strong style={{ color: "var(--frost)" }}>Prompts:</strong> The natural language descriptions you submit to generate websites. These are stored to serve your result and are not used for any other purpose.</li>
        <li><strong style={{ color: "var(--frost)" }}>Generated HTML:</strong> The website output produced by the AI pipeline, stored temporarily so you can download it.</li>
        <li><strong style={{ color: "var(--frost)" }}>IP addresses:</strong> Collected solely for rate-limiting purposes (3 generations per IP per day) and basic abuse prevention. We do not build profiles from IP addresses.</li>
        <li><strong style={{ color: "var(--frost)" }}>Cookies and local storage:</strong> Used for session management and your cookie consent preference. See our Cookie Policy for details.</li>
      </ul>
      <p style={pStyle}>
        We do not collect your name, email address, or payment information on the free tier. No account is required to use ArkhosAI.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>3. Legal Bases for Processing</h2>
      <p style={pStyle}>
        We process your data under the following GDPR legal bases:
      </p>
      <ul style={ulStyle}>
        <li><strong style={{ color: "var(--frost)" }}>Contractual necessity (Art. 6(1)(b)):</strong> Processing your prompt and generating HTML is necessary to provide the service you requested.</li>
        <li><strong style={{ color: "var(--frost)" }}>Legitimate interest (Art. 6(1)(f)):</strong> Storing IP addresses for rate limiting is necessary to protect the service from abuse and ensure fair access for all users.</li>
        <li><strong style={{ color: "var(--frost)" }}>Consent (Art. 6(1)(a)):</strong> Analytics cookies are only placed if you explicitly consent.</li>
      </ul>

      <hr style={hrStyle} />

      <h2 style={h2Style}>4. Sub-processors</h2>
      <p style={pStyle}>
        We use the following sub-processors to deliver the service. All are headquartered in France and process data exclusively within the European Union:
      </p>
      <ul style={ulStyle}>
        <li>
          <strong style={{ color: "var(--frost)" }}>Mistral AI SAS</strong> — 15 rue des Halles, 75001 Paris, France.<br />
          Purpose: AI language model inference (Planner, Designer, Builder, Reviewer agents).<br />
          Data transferred: your prompt text and intermediate agent outputs.
        </li>
        <li style={{ marginTop: "0.75rem" }}>
          <strong style={{ color: "var(--frost)" }}>Scaleway SAS</strong> — 8 rue de la Ville l'Évêque, 75008 Paris, France.<br />
          Purpose: Cloud infrastructure and hosting.<br />
          Data transferred: all application data at rest and in transit.
        </li>
      </ul>
      <p style={pStyle}>
        No data is transferred outside the European Union. We do not use US-based cloud providers for any component of the ArkhosAI service.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>5. No Training on Your Data</h2>
      <p style={pStyle}>
        Your prompts and generated content are never used to train, fine-tune, or improve AI models — neither ours nor Mistral AI's. We have contractual guarantees from Mistral AI confirming this. Your creative input belongs to you.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>6. Data Retention</h2>
      <p style={pStyle}>
        Generated website data (prompt + HTML output) is retained for <strong style={{ color: "var(--frost)" }}>30 days</strong> from the date of generation, after which it is automatically and permanently deleted from our servers.
      </p>
      <p style={pStyle}>
        IP addresses used for rate limiting are stored for <strong style={{ color: "var(--frost)" }}>24 hours</strong> (one rolling day window) and then deleted.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>7. Your Rights Under GDPR</h2>
      <p style={pStyle}>
        As a data subject under the GDPR, you have the following rights:
      </p>
      <ul style={ulStyle}>
        <li><strong style={{ color: "var(--frost)" }}>Right of access (Art. 15):</strong> Request a copy of all personal data we hold about you.</li>
        <li><strong style={{ color: "var(--frost)" }}>Right to rectification (Art. 16):</strong> Request correction of inaccurate personal data.</li>
        <li><strong style={{ color: "var(--frost)" }}>Right to erasure (Art. 17):</strong> Request deletion of your personal data ("right to be forgotten"). Because we do not link generations to identities, please contact us with your generation ID and/or IP address.</li>
        <li><strong style={{ color: "var(--frost)" }}>Right to restriction (Art. 18):</strong> Request that we restrict processing of your data.</li>
        <li><strong style={{ color: "var(--frost)" }}>Right to data portability (Art. 20):</strong> Request your data in a machine-readable format.</li>
        <li><strong style={{ color: "var(--frost)" }}>Right to object (Art. 21):</strong> Object to processing based on legitimate interest.</li>
        <li><strong style={{ color: "var(--frost)" }}>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time without affecting prior processing.</li>
      </ul>
      <p style={pStyle}>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:privacy@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>privacy@bleucommerce.fr</a>.
        We will respond within 30 days. You also have the right to lodge a complaint with the{" "}
        <strong style={{ color: "var(--frost)" }}>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) at{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ember)", textDecoration: "none" }}>www.cnil.fr</a>.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>8. Data Security</h2>
      <p style={pStyle}>
        All data is transmitted over HTTPS (TLS 1.2+). Our servers are hosted in Scaleway's ISO 27001-certified Paris data centres. Access to production infrastructure is restricted to authorised personnel only and protected by SSH key authentication.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>9. Changes to This Policy</h2>
      <p style={pStyle}>
        We may update this Privacy Policy from time to time. Material changes will be announced on our website. The date at the top of this page reflects the most recent revision.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>10. Contact</h2>
      <p style={pStyle}>
        For any privacy-related questions or to exercise your rights:<br />
        <a href="mailto:privacy@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>privacy@bleucommerce.fr</a><br />
        Bleucommerce SAS — 60 rue François 1er, 75008 Paris, France
      </p>
    </div>
  );
}
