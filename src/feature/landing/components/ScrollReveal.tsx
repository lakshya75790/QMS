"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // in milliseconds
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const getDirectionClasses = () => {
    if (isVisible) return "opacity-100 translate-x-0 translate-y-0";

    switch (direction) {
      case "up":
        return "opacity-0 translate-y-7";
      case "down":
        return "opacity-0 -translate-y-7";
      case "left":
        return "opacity-0 translate-x-7";
      case "right":
        return "opacity-0 -translate-x-7";
      case "none":
        return "opacity-0";
      default:
        return "opacity-0 translate-y-7";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: "600ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
      className={`transition-all will-change-transform ${getDirectionClasses()} ${className}`}
    >
      {children}
    </div>
  );
}
