import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Logo() {
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!dotRef.current) return;
    gsap.to(dotRef.current, {
      scale: 1.15,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <span className="group inline-flex items-baseline gap-0 select-none">
      <span
        className="font-display text-xl font-[800] tracking-[-0.03em] text-[var(--frost)] transition-all duration-300 group-hover:text-gradient-ember"
        style={{ fontFamily: "var(--font-display)" }}
      >
        arkhos
      </span>
      <span
        ref={dotRef}
        className="inline-block ml-[2px] w-[7px] h-[7px] rounded-full bg-[var(--ember)] mb-[3px]"
      />
    </span>
  );
}
