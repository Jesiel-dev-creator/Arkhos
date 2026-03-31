import { Link } from "react-router-dom";

const features = {
  free: [
    "3 generations/day",
    "Public gallery",
    "Community support",
    "5 templates",
  ],
  pro: [
    "50 generations/day",
    "Private generations",
    "Priority support",
    "Custom templates",
    "Custom domains",
    "API access",
  ],
  selfHosted: [
    "Unlimited generations",
    "Your own infrastructure",
    "Bring your API key",
    "Full control",
    "MIT license",
  ],
};

export default function Pricing() {
  return (
    <div
      style={{ backgroundColor: "var(--void)", minHeight: "100vh" }}
      className="px-6 py-16"
    >
      {/* Heading */}
      <div className="text-center mb-16">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            color: "var(--frost)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}
        >
          Pricing
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--muted)",
            fontSize: "1.125rem",
          }}
        >
          Simple, transparent pricing
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          maxWidth: "64rem",
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Card 1 — FREE */}
        <div
          style={{
            background: "rgba(13, 27, 42, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "2rem",
            flex: "1 1 280px",
            maxWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                background: "rgba(0, 212, 238, 0.1)",
                color: "var(--cyan)",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                marginBottom: "1rem",
              }}
            >
              Active
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.875rem",
                  color: "var(--frost)",
                }}
              >
                €0
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--muted)",
                  fontSize: "0.875rem",
                }}
              >
                /month
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                color: "var(--frost)",
                fontSize: "1.25rem",
                marginTop: "0.5rem",
              }}
            >
              Free
            </p>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {features.free.map((f) => (
              <li
                key={f}
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--frost)",
                  fontSize: "0.9375rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "var(--success)", fontSize: "1rem" }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "auto" }}>
            <Link
              to="/generate"
              style={{
                display: "block",
                textAlign: "center",
                background: "var(--ember)",
                color: "#fff",
                borderRadius: "10px",
                padding: "0.75rem 1.5rem",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Start Free →
            </Link>
          </div>
        </div>

        {/* Card 2 — PRO */}
        <div
          style={{
            background: "rgba(13, 27, 42, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "2rem",
            flex: "1 1 280px",
            maxWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            opacity: 0.6,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                background: "rgba(0, 212, 238, 0.1)",
                color: "var(--cyan)",
                borderRadius: "9999px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                marginBottom: "1rem",
              }}
            >
              Coming Soon
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.875rem",
                  color: "var(--frost)",
                }}
              >
                €9
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--muted)",
                  fontSize: "0.875rem",
                }}
              >
                /month
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                color: "var(--frost)",
                fontSize: "1.25rem",
                marginTop: "0.5rem",
              }}
            >
              Pro
            </p>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {features.pro.map((f) => (
              <li
                key={f}
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--frost)",
                  fontSize: "0.9375rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "var(--success)", fontSize: "1rem" }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "auto" }}>
            <button
              disabled
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                background: "var(--deep)",
                color: "var(--muted)",
                borderRadius: "10px",
                padding: "0.75rem 1.5rem",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                border: "none",
                cursor: "not-allowed",
              }}
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Card 3 — SELF-HOSTED */}
        <div
          style={{
            background: "rgba(13, 27, 42, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "2rem",
            flex: "1 1 280px",
            maxWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.875rem",
                  color: "var(--frost)",
                }}
              >
                €0
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--muted)",
                  fontSize: "0.875rem",
                }}
              >
                &nbsp;forever
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                color: "var(--frost)",
                fontSize: "1.25rem",
                marginTop: "0.5rem",
              }}
            >
              Self-Hosted
            </p>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {features.selfHosted.map((f) => (
              <li
                key={f}
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--frost)",
                  fontSize: "0.9375rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ color: "var(--success)", fontSize: "1rem" }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "auto" }}>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                background: "transparent",
                color: "var(--frost)",
                borderRadius: "10px",
                padding: "0.75rem 1.5rem",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.9375rem",
                textDecoration: "none",
                border: "1px solid var(--border)",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--frost)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
