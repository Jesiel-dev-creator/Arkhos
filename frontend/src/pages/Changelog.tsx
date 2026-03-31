const v01Features = [
  "4-agent pipeline: Planner → Designer → Builder → Reviewer",
  "React CDN output with Tailwind, GSAP, Unsplash images",
  "Plan Mode: review the AI's plan before building",
  "Iteration chat: refine your site with follow-up messages",
  "5 templates: French Bakery, SaaS, Portfolio, Restaurant, Agency",
  "Real-time cost tracking in EUR",
  "Gallery of recent creations",
  "EU sovereign: Scaleway Paris + Mistral AI",
  "Open source: MIT license",
];

const v02Upcoming = [
  "React project export (zip)",
  "GitHub push integration",
  "Figma import",
  "Template marketplace",
];

export default function Changelog() {
  return (
    <div
      style={{ backgroundColor: "var(--void)", minHeight: "100vh" }}
    >
      <div
        style={{
          maxWidth: "48rem",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        {/* Page heading */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            color: "var(--frost)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: 1.1,
            marginBottom: "3rem",
          }}
        >
          Changelog
        </h1>

        {/* v0.1.0 entry */}
        <div
          style={{
            borderLeft: "2px solid var(--border)",
            paddingLeft: "2rem",
            position: "relative",
          }}
        >
          {/* Dot on timeline */}
          <div
            style={{
              position: "absolute",
              left: "-0.4375rem",
              top: "0.375rem",
              width: "0.75rem",
              height: "0.75rem",
              borderRadius: "50%",
              backgroundColor: "var(--ember)",
            }}
          />

          {/* Version + date row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "0.75rem",
                color: "var(--ember)",
                background: "rgba(255, 107, 53, 0.1)",
                borderRadius: "9999px",
                padding: "0.25rem 0.625rem",
              }}
            >
              v0.1.0
            </span>
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontSize: "0.8125rem",
                color: "var(--muted)",
              }}
            >
              March 2026
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "var(--frost)",
              fontSize: "1.375rem",
              marginBottom: "1.25rem",
            }}
          >
            Initial Release
          </h2>

          {/* Features list */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
            }}
          >
            {v01Features.map((feature) => (
              <li
                key={feature}
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--frost)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.625rem",
                }}
              >
                <span
                  style={{
                    color: "var(--cyan)",
                    marginTop: "0.1rem",
                    flexShrink: 0,
                    fontSize: "0.75rem",
                  }}
                >
                  ▸
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* What's Next */}
        <div style={{ marginTop: "4rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "var(--frost)",
              fontSize: "1.375rem",
              marginBottom: "1.25rem",
            }}
          >
            What's Next
          </h2>

          <div
            style={{
              background: "rgba(13, 27, 42, 0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                marginBottom: "1rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-code)",
                  fontSize: "0.75rem",
                  color: "var(--cyan)",
                  background: "rgba(0, 212, 238, 0.1)",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.625rem",
                }}
              >
                v0.2
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--muted)",
                  fontSize: "0.875rem",
                }}
              >
                React Projects — Month 2
              </span>
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {v02Upcoming.map((item) => (
                <li
                  key={item}
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--muted)",
                    fontSize: "0.9375rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                  }}
                >
                  <span style={{ color: "var(--border)", fontSize: "0.75rem" }}>○</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
