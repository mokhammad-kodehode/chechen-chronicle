"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** delay in ms */
  delay?: number;
  /** direction of entrance */
  from?: "up" | "down" | "left" | "right" | "none";
};

export function Reveal({ children, className, delay = 0, from = "up" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const offset =
    from === "up"
      ? "translate-y-6"
      : from === "down"
      ? "-translate-y-6"
      : from === "left"
      ? "translate-x-6"
      : from === "right"
      ? "-translate-x-6"
      : "";

  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-700 ease-out",
        shown ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${offset}`,
        className ?? "",
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
