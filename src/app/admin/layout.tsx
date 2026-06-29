"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";

const tabs = [
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/lessons", label: "Lessons & Quizzes" },
  { href: "/admin/placement", label: "Placement Tests" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAuth role="ADMIN">
      <section className="page-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>Platform management</h1>
            <p className="page-header__lead">
              Create subjects, build lesson paths, attach quizzes, and configure placement tests.
            </p>
          </div>
        </header>

        <nav className="admin-nav" aria-label="Admin sections">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`admin-nav__link ${pathname === tab.href ? "is-active" : ""}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {children}
      </section>
    </RequireAuth>
  );
}
