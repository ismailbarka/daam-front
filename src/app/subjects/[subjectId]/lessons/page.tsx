"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { API_URL } from "@/lib/api";
import { getErrorMessage } from "@/lib/api";
import type { Lesson, Subject } from "@/lib/types";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
import { FadeIn, PageTransition } from "@/components/layout/PageTransition";

export default function SubjectLessonsIndexPage() {
  const params = useParams<{ subjectId: string }>();
  const subjectId = Number(params.subjectId);
  const { authHeaders, setMessage } = useAuth();
  const { t } = useLocale();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setMessage("");

      try {
        const [subjectsResponse, lessonsResponse] = await Promise.all([
          fetch(`${API_URL}/subjects`, { headers: authHeaders }),
          fetch(`${API_URL}/lessons?subjectId=${subjectId}`, {
            headers: authHeaders,
          }),
        ]);

        const subjectsData = await subjectsResponse.json().catch(() => null);
        const lessonsData = await lessonsResponse.json().catch(() => null);

        if (!subjectsResponse.ok) {
          const text = Array.isArray(subjectsData?.message)
            ? subjectsData.message.join(", ")
            : subjectsData?.message;
          throw new Error(text || "Request failed");
        }
        if (!lessonsResponse.ok) {
          const text = Array.isArray(lessonsData?.message)
            ? lessonsData.message.join(", ")
            : lessonsData?.message;
          throw new Error(text || "Request failed");
        }

        const matchedSubject = (subjectsData as Subject[]).find((item) => item.id === subjectId) || null;
        setSubject(matchedSubject);
        setLessons(lessonsData as Lesson[]);
      } catch (error) {
        setMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    if (subjectId) void load();
  }, [authHeaders, subjectId, setMessage]);

  const orderedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const completedCount = orderedLessons.filter((lesson) => lesson.status === "completed").length;
  const nextLesson = orderedLessons.find((lesson) => lesson.status !== "completed") || orderedLessons[0];

  return (
    <RequireAuth role="STUDENT">
      {isLoading ? (
        <LoadingOverlay label={t.common.loadingLesson} />
      ) : (
        <PageTransition>
          <section className="page-shell">
            <header className="page-header">
              <div>
                <p className="eyebrow">{subject?.name || "Subject"}</p>
                <h1>{t.lessonIndex.title}</h1>
                <p className="page-header__lead">{t.lessonIndex.lead}</p>
              </div>
              <div className="lesson-path-stats">
                <div className="lesson-path-stat">
                  <strong>{completedCount}</strong>
                  <span>{t.common.completed}</span>
                </div>
                <div className="lesson-path-stat">
                  <strong>{orderedLessons.length}</strong>
                  <span>{t.common.totalLessons}</span>
                </div>
                {nextLesson ? (
                  <Link href={`/subjects/${subjectId}/lessons/${nextLesson.id}`} className="btn btn--primary">
                    {nextLesson.status === "completed" ? t.lessonIndex.reviewNextLabel : t.lessonIndex.continueLabel}
                  </Link>
                ) : null}
              </div>
            </header>

            {orderedLessons.length === 0 ? (
              <div className="empty-state">{t.common.noLessons}</div>
            ) : (
              <div className="lesson-list">
                {orderedLessons.map((lesson, index) => (
                  <FadeIn key={lesson.id} delay={index * 70}>
                    <Link
                      href={`/subjects/${subjectId}/lessons/${lesson.id}`}
                      className={`lesson-list-card lesson-list-card--${lesson.status}`}
                    >
                      <div className="lesson-list-card__meta">
                        <span className={`lesson-step lesson-step--small ${lesson.status}`}>{lesson.order}</span>
                        <div>
                          <p className="eyebrow">
                            {t.lessonIndex.lessonPrefix} {lesson.order}
                          </p>
                          <h2>{lesson.title}</h2>
                          <p>{lesson.description || t.lessonIndex.openLessonCopy}</p>
                        </div>
                      </div>
                      <div className="lesson-list-card__side">
                        <span className={`status-badge status-badge--${lesson.status}`}>
                          {t.status[lesson.status]}
                        </span>
                        <span className="lesson-list-card__arrow" aria-hidden="true">
                          →
                        </span>
                      </div>
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
