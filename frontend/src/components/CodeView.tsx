import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { codeToHtml } from "shiki";

interface CodeViewProps {
  html: string;
}

export default function CodeView({ html }: CodeViewProps) {
  const [highlighted, setHighlighted] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    codeToHtml(html, {
      lang: "html",
      theme: "vitesse-dark",
    }).then(setHighlighted);
  }, [html]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--void)] overflow-hidden"
    >
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--deep)] border border-[var(--border)] text-[11px] text-[var(--muted)] hover:text-[var(--frost)] hover:border-[var(--muted)] transition-all duration-200"
      >
        {copied ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>

      {/* Code */}
      <div
        className="overflow-auto max-h-[400px] p-4 text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_code]:!bg-transparent"
        style={{ fontFamily: "var(--font-code)" }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </motion.div>
  );
}
