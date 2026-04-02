"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  filename?: string;
  className?: string;
}

function tokenize(code: string, lang: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (lang === "json") {
    html = html
      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="tk-key">$1</span>$2')
      .replace(/:(\s*)("(?:[^"\\]|\\.)*")/g, ':<span class="tk-str">$2</span>')
      .replace(/:\s*(true|false|null|\d+\.?\d*)/g, ': <span class="tk-lit">$1</span>');
    return html;
  }

  // Comments
  html = html.replace(/(\/\/.*$)/gm, '<span class="tk-cmt">$1</span>');
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tk-cmt">$1</span>');

  // Strings
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="tk-str">$1</span>');

  // Keywords
  html = html.replace(
    /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|new|async|await|default|type|interface|enum)\b/g,
    '<span class="tk-kw">$1</span>',
  );

  // JSX tags
  html = html.replace(/(&lt;\/?)([\w.]+)/g, '$1<span class="tk-tag">$2</span>');

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="tk-num">$1</span>');

  return html;
}

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["ts", "tsx", "js", "jsx"].includes(ext)) return "tsx";
  if (ext === "json") return "json";
  if (["css", "scss"].includes(ext)) return "css";
  if (["md", "mdx"].includes(ext)) return "md";
  return "tsx";
}

export function CodeBlock({ code, filename, className }: CodeBlockProps) {
  const lang = filename ? getLang(filename) : "tsx";
  const highlighted = useMemo(() => tokenize(code, lang), [code, lang]);
  const lines = highlighted.split("\n");

  return (
    <div className={cn("overflow-auto", className)}>
      <pre className="p-4 text-xs leading-6 font-[var(--font-code)]">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="inline-block w-10 shrink-0 text-right pr-4 text-[var(--text-muted)]/50 select-none">
                {i + 1}
              </span>
              <span
                className="flex-1 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
