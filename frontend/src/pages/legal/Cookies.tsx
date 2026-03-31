export default function Cookies() {
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

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "0.625rem 0.75rem",
    borderBottom: "1px solid var(--border)",
    color: "var(--frost)",
    fontWeight: 600,
    background: "var(--deep)",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.625rem 0.75rem",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "top",
    lineHeight: "1.6",
  };

  return (
    <div style={pageStyle}>
      <h1 style={h1Style}>Cookie Policy</h1>
      <p style={subtitleStyle}>Last updated: March 30, 2026</p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>1. What Are Cookies?</h2>
      <p style={pStyle}>
        Cookies are small text files placed on your device by a website. ArkhosAI uses a minimal number of cookies and browser local storage entries, strictly limited to what is necessary to operate the service and, optionally, to understand how it is used.
      </p>
      <p style={pStyle}>
        We do not use advertising cookies, social media tracking pixels, or any cross-site tracking technology. We will never sell or share your browsing behaviour with third parties.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>2. Essential Cookies and Local Storage</h2>
      <p style={pStyle}>
        These are strictly necessary to provide the service. They cannot be disabled without breaking core functionality. No consent is required for these under GDPR Recital 47 and the ePrivacy Directive.
      </p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Purpose</th>
            <th style={thStyle}>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><code style={{ fontFamily: "var(--font-code)", fontSize: "0.85em" }}>session</code></td>
            <td style={tdStyle}>HTTP Cookie</td>
            <td style={tdStyle}>Maintains your session while using the generator, associates your generation ID with your browser tab.</td>
            <td style={tdStyle}>Session (deleted when browser tab closes)</td>
          </tr>
          <tr>
            <td style={tdStyle}><code style={{ fontFamily: "var(--font-code)", fontSize: "0.85em" }}>cookie_consent</code></td>
            <td style={tdStyle}>localStorage</td>
            <td style={tdStyle}>Stores your cookie consent preference so we do not ask you again on every visit.</td>
            <td style={tdStyle}>1 year</td>
          </tr>
        </tbody>
      </table>

      <hr style={hrStyle} />

      <h2 style={h2Style}>3. Analytics Cookies (Consent Required)</h2>
      <p style={pStyle}>
        We use <strong style={{ color: "var(--frost)" }}>Plausible Analytics</strong> to understand how ArkhosAI is used in aggregate. Plausible is an EU-hosted, privacy-respecting analytics tool that does not use cookies by default and does not track individuals across sites.
      </p>
      <p style={pStyle}>
        If you have consented to analytics, Plausible collects:
      </p>
      <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.75", marginBottom: "1rem" }}>
        <li>Page views and navigation paths</li>
        <li>Referrer source (where you came from)</li>
        <li>Device type, browser, and operating system (aggregated, not individual)</li>
        <li>Country of origin (derived from IP; IP address is never stored)</li>
      </ul>
      <p style={pStyle}>
        Plausible is operated by <strong style={{ color: "var(--frost)" }}>Plausible Insights OÜ</strong>, an EU company. Data is stored on servers in the European Union. No data is shared with Google, Meta, or any US-based analytics provider.
      </p>
      <p style={pStyle}>
        Analytics are only activated after you provide explicit consent via the cookie banner. You can withdraw consent at any time by clicking "Cookie Settings" in the site footer.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>4. What We Do Not Use</h2>
      <p style={pStyle}>
        To be explicit, ArkhosAI does <strong style={{ color: "var(--frost)" }}>not</strong> use:
      </p>
      <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.75", marginBottom: "1rem" }}>
        <li>Google Analytics or any Google tracking product</li>
        <li>Meta Pixel or any Meta/Facebook tracking</li>
        <li>Hotjar, Mixpanel, Amplitude, or similar behavioural analytics</li>
        <li>Advertising or retargeting cookies</li>
        <li>Third-party social login cookies</li>
        <li>Any cookie that tracks you across websites</li>
      </ul>

      <hr style={hrStyle} />

      <h2 style={h2Style}>5. Managing Your Preferences</h2>
      <p style={pStyle}>
        You can manage or withdraw your cookie consent at any time:
      </p>
      <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.75", marginBottom: "1rem" }}>
        <li>Click "Cookie Settings" in the footer of any page on ArkhosAI.</li>
        <li>Clear your browser's local storage and cookies to reset all preferences.</li>
        <li>Use your browser's built-in privacy settings to block cookies entirely.</li>
      </ul>
      <p style={pStyle}>
        Note that disabling essential local storage entries (such as <code style={{ fontFamily: "var(--font-code)", fontSize: "0.9em" }}>cookie_consent</code>) will cause the consent banner to appear on every visit.
      </p>

      <hr style={hrStyle} />

      <h2 style={h2Style}>6. Contact</h2>
      <p style={pStyle}>
        For questions about our use of cookies:<br />
        <a href="mailto:privacy@bleucommerce.fr" style={{ color: "var(--ember)", textDecoration: "none" }}>privacy@bleucommerce.fr</a><br />
        Bleucommerce SAS — 60 rue François 1er, 75008 Paris, France
      </p>
    </div>
  );
}
