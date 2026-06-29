"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
import { FadeIn, PageTransition } from "@/components/layout/PageTransition";

const subjectIcons = ["📐", "🔬", "📚", "🌍", "💻", "🎨", "🧮", "🗣️"];

export default function SubjectsContent() {
  const searchParams = useSearchParams();
  const { token, authHeaders, setMessage } = useAuth();
  const { t } = useLocale();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const placed = searchParams.get("placed") === "1";

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch("https://edu-platform-backend-one.vercel.app/subjects", {
          headers: authHeaders.Authorization ? authHeaders : { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          const text = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
          throw new Error(text || "Request failed");
        }
        setSubjects(data as Subject[]);
      } catch (error) {
        const text = getErrorMessage(error);
        if (text.toLowerCase().includes("placement")) {
          window.location.href = "/placement";
          return;
        }
        setMessage(text);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) void load();
  }, [token, authHeaders, setMessage]);

  return (
    <RequireAuth role="STUDENT">
      {isLoading ? (
        <LoadingOverlay label={t.common.loadingSubjects} />
      ) : (
        <PageTransition>
          <section className="page-shell">
            <header className="page-header">
              <div>
                <p className="eyebrow">{t.common.lessonPath}</p>
                <h1>{t.subjects.title}</h1>
                <p className="page-header__lead">{t.subjects.lead}</p>
              </div>
            </header>

            {placed ? (
              <div className="banner banner--success fade-in">
                {t.subjects.placedBanner}
              </div>
            ) : null}

            {subjects.length === 0 ? (
              <div className="empty-state">{t.common.noSubjects}</div>
            ) : (
              <div className="subject-grid">
                {subjects.map((subject, index) => (
                  <FadeIn key={subject.id} delay={index * 70}>
                    <Link href={`/subjects/${subject.id}/lessons`} className="subject-card">
                      <span className="subject-card__icon" aria-hidden="true">
                        {subjectIcons[index % subjectIcons.length]}
                      </span>
                      <div>
                        <h2>{subject.name}</h2>
                        <p>{t.subjects.openLessons}</p>
                      </div>
                      <span className="subject-card__arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}
          </section>
        </PageTransition>
      )}
    </RequireAuth>
  );
}
