import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{ minHeight: "60vh" }}
      className="flex items-center justify-center"
    >
      <div className="text-center flex flex-col items-center gap-4">
        <h1
          className="text-8xl font-extrabold select-none"
          style={{
            fontFamily: "var(--font-display, 'Syne', sans-serif)",
            background: "linear-gradient(135deg, #FF6B35, #FF9966)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </h1>
        <p
          className="text-lg"
          style={{ color: "var(--muted, #7B8FA3)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
        >
          This page got lost in the void
        </p>
        <Link
          to="/"
          className="inline-block text-white font-medium text-sm"
          style={{
            background: "var(--ember, #FF6B35)",
            borderRadius: "10px",
            padding: "0.625rem 1.5rem",
            fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
            textDecoration: "none",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
