interface RoadmapCard {
  version: string;
  versionColor: string;
  status: string;
  statusColor: string;
  statusBg: string;
  title: string;
  items: string[];
  highlight?: boolean;
}

const cards: RoadmapCard[] = [
  {
    version: "v0.1",
    versionColor: "var(--ember)",
    status: "NOW",
    statusColor: "var(--success)",
    statusBg: "rgba(34, 214, 138, 0.12)",
    title: "Static Sites",
    items: [
      "4-agent pipeline",
      "Plan Mode",
      "Iteration chat",
      "5 templates",
      "Gallery",
    ],
    highlight: true,
  },
  {
    version: "v0.2",
    versionColor: "var(--cyan)",
    status: "Month 2",
    statusColor: "var(--muted)",
    statusBg: "rgba(123, 143, 163, 0.1)",
    title: "React Projects",
    items: [
      "React zip export",
      "GitHub push",
      "Figma import",
      "Template market",
      "Vercel deploy",
    ],
  },
  {
    version: "v0.3",
    versionColor: "var(--muted)",
    status: "Month 3",
    statusColor: "var(--muted)",
    statusBg: "rgba(123, 143, 163, 0.1)",
    title: "Full-Stack Apps",
    items: [
      "Supabase backend",
      "Auth + DB",
      "API routes",
      "Pro tier €9/mo",
      "Self-host Docker",
    ],
  },
  {
    version: "v0.4",
    versionColor: "var(--muted)",
    status: "Month 4",
    statusColor: "var(--muted)",
    statusBg: "rgba(123, 143, 163, 0.1)",
    title: "Mobile Apps",
    items: [
      "React Native",
      "Expo preview",
      "SSO",
      "Team workspaces",
      "Enterprise",
    ],
  },
];

export default function Roadmap() {
  return (
    <div
      style={{ backgroundColor: "var(--void)", minHeight: "100vh" }}
    >
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "4rem 1.5rem",
        }}
      >
        {/* Heading */}
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
          Roadmap
        </h1>

        {/* Cards row */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            overflowX: "auto",
            paddingBottom: "1rem",
            scrollSnapType: "x mandatory",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.version}
              style={{
                background: "rgba(13, 27, 42, 0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid var(--border)",
                borderLeft: card.highlight
                  ? "3px solid var(--ember)"
                  : "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.75rem",
                flex: "0 0 260px",
                minWidth: "220px",
                maxWidth: "300px",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                scrollSnapAlign: "start",
              }}
            >
              {/* Version + status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-code)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: card.versionColor,
                  }}
                >
                  {card.version}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: card.statusColor,
                    background: card.statusBg,
                    borderRadius: "9999px",
                    padding: "0.2rem 0.625rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {card.status}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  color: "var(--frost)",
                  fontSize: "1.125rem",
                  margin: 0,
                }}
              >
                {card.title}
              </h3>

              {/* Items */}
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
                {card.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "var(--font-body)",
                      color: card.highlight ? "var(--frost)" : "var(--muted)",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        color: card.highlight ? "var(--ember)" : "var(--border)",
                        fontSize: "0.625rem",
                        flexShrink: 0,
                      }}
                    >
                      {card.highlight ? "●" : "○"}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
