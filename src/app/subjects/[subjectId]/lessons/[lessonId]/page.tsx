"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { API_URL } from "@/lib/api";
import { getErrorMessage } from "@/lib/api";
import type { Lesson, QuizResult, Subject } from "@/lib/types";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
import { PageTransition } from "@/components/layout/PageTransition";
import { QuizPanel } from "@/components/quiz/QuizPanel";

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1];
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1];
      }
    }

    if (!videoId) return null;
    videoId = videoId.split("&")[0].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export default function LessonDetailPage() {
  const params = useParams<{ subjectId: string; lessonId: string }>();
  const subjectId = Number(params.subjectId);
  const lessonId = Number(params.lessonId);
  const { authHeaders, isBusy, setStatus, setMessage } = useAuth();
  const { t } = useLocale();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>({});
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
        setLessons((lessonsData as Lesson[]).sort((a, b) => a.order - b.order));
        setQuizAnswers({});
        setQuizResults({});
      } catch (error) {
        setMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    if (subjectId) void load();
  }, [authHeaders, setMessage, subjectId]);

  const orderedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const lessonIndex = orderedLessons.findIndex((item) => item.id === lessonId);
  const lesson = lessonIndex >= 0 ? orderedLessons[lessonIndex] : null;
  const nextLesson = lessonIndex >= 0 ? orderedLessons[lessonIndex + 1] : null;
  const previousLesson = lessonIndex > 0 ? orderedLessons[lessonIndex - 1] : null;
  const result = lesson ? quizResults[lesson.id] : undefined;
  const passed = lesson?.status === "completed" || Boolean(result?.passed);
  const embedUrl = lesson?.youtubeUrl ? getYoutubeEmbedUrl(lesson.youtubeUrl) : null;

  async function submitQuiz() {
    if (!lesson) return;

    setStatus("loading");
    setMessage("");

    try {
      const answers = lesson.quiz.map((question) => ({
        questionId: question.id,
        answer: quizAnswers[question.id],
      }));

      if (answers.some((answer) => !answer.answer)) {
        throw new Error("Please answer every quiz question");
      }

      const response = await fetch(
        `${API_URL}/lessons/${lesson.id}/quiz/submit`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ answers }),
        },
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const text = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        throw new Error(text || "Request failed");
      }

      setQuizResults((current) => ({ ...current, [lesson.id]: data as QuizResult }));

      const updatedResponse = await fetch(
        `${API_URL}/lessons?subjectId=${subjectId}`,
        { headers: authHeaders },
      );
      const updatedLessons = await updatedResponse.json().catch(() => null);
      if (updatedResponse.ok) {
        setLessons((updatedLessons as Lesson[]).sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  if (isLoading) {
    return (
      <RequireAuth role="STUDENT">
        <LoadingOverlay label={t.common.loadingLesson} />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth role="STUDENT">
      <PageTransition>
        <section className="page-shell">
          <header className="page-header">
            <div>
              <p className="eyebrow">{subject?.name || "Subject"}</p>
              <h1>{lesson?.title || t.lessonDetail.title}</h1>
              <p className="page-header__lead">{t.lessonDetail.lead}</p>
            </div>

            <div className="lesson-detail-actions">
              <Link href={`/subjects/${subjectId}/lessons`} className="btn btn--secondary">
                {t.common.backToLessons}
              </Link>
              {nextLesson && passed ? (
                <Link href={`/subjects/${subjectId}/lessons/${nextLesson.id}`} className="btn btn--primary">
                  {t.common.nextLesson}
                </Link>
              ) : null}
            </div>
          </header>

          {!lesson ? (
            <div className="empty-state">
              {t.common.lessonNotFound}.{" "}
              <Link href={`/subjects/${subjectId}/lessons`}>{t.common.returnToList}</Link>
            </div>
          ) : (
            <article
              className={`lesson-detail-card lesson-detail-card--${lesson.status}`}
              key={lesson.id}
            >
              <div className="lesson-detail-card__header">
                <div>
                  <p className="eyebrow">
                    {t.lessonDetail.lessonPrefix} {lesson.order}
                  </p>
                  <h2>{lesson.title}</h2>
                </div>
                <span className={`status-badge status-badge--${lesson.status}`}>{t.status[lesson.status]}</span>
              </div>

              {lesson.description ? <p className="muted">{lesson.description}</p> : null}

              {lesson.youtubeUrl ? (
                embedUrl ? (
                  <div className="video-embed">
                    <iframe
                      src={embedUrl}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a className="video-chip" href={lesson.youtubeUrl} target="_blank" rel="noreferrer">
                    <span aria-hidden="true">▶</span> {t.common.watchVideo}
                  </a>
                )
              ) : null}

              {lesson.status === "locked" ? (
                <p className="locked-note">{t.lessonDetail.passToUnlock}</p>
              ) : (
                <>
                  <QuizPanel
                    questions={lesson.quiz}
                    answers={quizAnswers}
                    onAnswer={(questionId, answer) =>
                      setQuizAnswers((current) => ({ ...current, [questionId]: answer }))
                    }
                    onSubmit={submitQuiz}
                    isBusy={isBusy}
                    result={result}
                    disabled={lesson.status === "completed"}
                  />

                  {passed ? (
                    <div className="lesson-next-card">
                      <div>
                        <p className="eyebrow">{t.common.greatWork}</p>
                        <h3>
                          {nextLesson ? t.common.unlockedNextLesson : t.common.completedSubject}
                        </h3>
                        <p className="muted">
                          {nextLesson
                            ? t.common.continueWhileFresh
                            : t.common.headBackOrReview}
                        </p>
                      </div>
                      <div className="lesson-next-card__actions">
                        {previousLesson ? (
                          <Link
                            href={`/subjects/${subjectId}/lessons/${previousLesson.id}`}
                            className="btn btn--secondary"
                          >
                            {t.common.previousLesson}
                          </Link>
                        ) : null}
                        {nextLesson ? (
                          <Link
                            href={`/subjects/${subjectId}/lessons/${nextLesson.id}`}
                            className="btn btn--primary"
                          >
                            {t.common.nextLesson}
                          </Link>
                        ) : (
                          <Link href={`/subjects/${subjectId}/lessons`} className="btn btn--primary">
                            {t.common.backToLessonList}
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          )}
        </section>
      </PageTransition>
    </RequireAuth>
  );
}
