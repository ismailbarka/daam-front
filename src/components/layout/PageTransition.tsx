"use client";

import type { ReactNode } from "react";

export function PageTransition({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`page-enter ${className}`.trim()}>{children}</div>;
}

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div className="fade-in" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
