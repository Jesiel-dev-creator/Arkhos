"use client";
import React, { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";

interface Particle {
  id: number;
  left: number;
  duration: number;
  opacity: number;
}

interface CardTransform {
  rotateX: number;
  rotateY: number;
  translateY: number;
  scale: number;
}

const useCardTransform = () => {
  const [transform, setTransform] = useState<CardTransform>({
    rotateX: 0,
    rotateY: 0,
    translateY: 0,
    scale: 1,
  });

  const handleMouseMove = (
    e: MouseEvent<HTMLDivElement>,
    cardRef: React.RefObject<HTMLDivElement>
  ): void => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (y / rect.height) * -20;
    const rotateY = (x / rect.width) * 20;

    setTransform({
      rotateX,
      rotateY,
      translateY: -20,
      scale: 1.02,
    });
  };

  const handleMouseLeave = (): void => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      translateY: 0,
      scale: 1,
    });
  };

  return { transform, handleMouseMove, handleMouseLeave };
};

const useParticles = (isActive: boolean) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: particleId.current++,
        left: Math.random() * 100,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.2,
      };

      setParticles((prev) => [...prev, newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, newParticle.duration * 1000);
    }, 300);

    return () => clearInterval(interval);
  }, [isActive]);

  return particles;
};

const useRipple = () => {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const rippleId = useRef<number>(0);

  const createRipple = (e: MouseEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = 60;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: rippleId.current++,
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return { ripples, createRipple };
};

const FloatingCard: React.FC = () => {
  const { transform, handleMouseMove, handleMouseLeave } = useCardTransform();
  const { ripples, createRipple } = useRipple();
  const particles = useParticles(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const getTransformStyle = (): string => {
    return `translateY(${transform.translateY}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`;
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement>): void => {
    createRipple(e);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 sm:p-6 lg:p-8">
      <div
        className="perspective-1000"
        onMouseMove={(e) =>
          handleMouseMove(e, cardRef as React.RefObject<HTMLDivElement>)
        }
        onMouseLeave={handleMouseLeave}
        style={{ perspective: "1000px" }}
      >
        <div
          ref={cardRef}
          onClick={handleCardClick}
          className="relative w-80 sm:w-96 lg:w-[28rem] h-auto min-h-[500px] p-6 sm:p-8 rounded-3xl backdrop-blur-3xl cursor-pointer transition-all duration-500 transform-gpu bg-white/10 border border-white/20 text-white shadow-lg shadow-white/10"
          style={{
            transform: getTransformStyle(),
            animation: "float 6s ease-in-out infinite",
          }}
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-0.5 h-0.5 rounded-full bg-white/60"
                style={{
                  left: `${particle.left}%`,
                  opacity: particle.opacity,
                  animation: `particleFloat ${particle.duration}s linear infinite`,
                }}
              />
            ))}
          </div>

          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute w-15 h-15 rounded-full pointer-events-none bg-white/30"
              style={{
                left: ripple.x,
                top: ripple.y,
                animation: "ripple 0.6s ease-out",
              }}
            />
          ))}

          <div className="relative z-10 h-full flex flex-col">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight bg-gradient-to-br bg-clip-text text-transparent from-white to-gray-300">
              Make things float in air
            </h1>

            <p className="text-sm sm:text-base opacity-80 mb-6 sm:mb-8 leading-relaxed">
              Did you like our Floating Card?
            </p>

            <img
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
              alt="Forest scene"
              crossOrigin="anonymous"
              className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-xl mb-6 sm:mb-8 transition-all duration-300 shadow-lg shadow-black/30"
              style={{
                transform:
                  transform.scale > 1
                    ? "translateZ(20px) scale(1.03)"
                    : "none",
              }}
            />

            <div className="mt-auto flex justify-between sm:gap-4">
              <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-300 hover:translate-x-1 hover:opacity-80 bg-[#1a1a1a] border border-white text-white rounded-lg">
                Try now
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </button>

              <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium transition-all duration-300 hover:scale-105 bg-[#1a1a1a] border border-white text-white rounded-lg">
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-10px) rotateX(2deg); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(100%) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100%) scale(1); opacity: 0; }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FloatingCard;
