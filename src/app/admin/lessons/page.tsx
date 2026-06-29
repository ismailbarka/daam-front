"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { cleanPayload, getErrorMessage } from "@/lib/api";
import type { AnswerOption, Lesson, QuizQuestion, Subject } from "@/lib/types";
import { InlineLoader } from "@/components/layout/LoadingOverlay";
import { PageTransition } from "@/components/layout/PageTransition";

export default function AdminLessonsPage() {
  const { authHeaders, isBusy, setStatus, setMessage } = useAuth();
  const { locale, t } = useLocale();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonForm, setLessonForm] = useState({
    subjectId: "",
    title: "",
    description: "",
    youtubeUrl: "",
    order: "1",
    passingScore: "70",
  });
  const [quizForm, setQuizForm] = useState({
    lessonId: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A" as AnswerOption,
  });

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subjectResponse, lessonResponse] = await Promise.all([
        fetch("https://edu-platform-backend-one.vercel.app/subjects", { headers: authHeaders }),
        fetch("https://edu-platform-backend-one.vercel.app/lessons", { headers: authHeaders }),
      ]);
      const subjectData = await subjectResponse.json().catch(() => null);
      const lessonData = await lessonResponse.json().catch(() => null);
      if (!subjectResponse.ok) throw new Error(subjectData?.message || "Request failed");
      if (!lessonResponse.ok) throw new Error(lessonData?.message || "Request failed");
      setSubjects(subjectData as Subject[]);
      setLessons(lessonData as Lesson[]);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, setMessage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAdminData();
  }, [loadAdminData]);

  const lessonsBySubject = subjects.map((subject) => ({
    subject,
    lessons: lessons.filter((lesson) => lesson.subjectId === subject.id),
  }));

  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (!lessonForm.subjectId) throw new Error(t.admin.chooseSubject);

      const response = await fetch("https://edu-platform-backend-one.vercel.app/lessons", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(
          cleanPayload({
            subjectId: Number(lessonForm.subjectId),
            title: lessonForm.title,
            description: lessonForm.description,
            youtubeUrl: lessonForm.youtubeUrl,
            order: Number(lessonForm.order),
            passingScore: Number(lessonForm.passingScore || 70),
          }),
        ),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");

      setLessonForm({
        subjectId: lessonForm.subjectId,
        title: "",
        description: "",
        youtubeUrl: "",
        order: "1",
        passingScore: "70",
      });
      await loadAdminData();
      setMessage(locale === "ar" ? "تم إنشاء الدرس" : "Leçon créée");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function deleteLesson(lessonId: number) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`https://edu-platform-backend-one.vercel.app/lessons/${lessonId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");
      await loadAdminData();
      setMessage(locale === "ar" ? "تم حذف الدرس" : "Leçon supprimée");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function createQuizQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (!quizForm.lessonId) throw new Error("Choose a lesson");

      const response = await fetch("https://edu-platform-backend-one.vercel.app/quiz/questions", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          lessonId: Number(quizForm.lessonId),
          question: quizForm.question,
          optionA: quizForm.optionA,
          optionB: quizForm.optionB,
          optionC: quizForm.optionC,
          optionD: quizForm.optionD,
          correctAnswer: quizForm.correctAnswer,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");

      setQuizForm({
        lessonId: quizForm.lessonId,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      await loadAdminData();
      setMessage(locale === "ar" ? "تمت إضافة سؤال الاختبار" : "Question ajoutée");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function deleteQuizQuestion(questionId: number) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`https://edu-platform-backend-one.vercel.app/quiz/questions/${questionId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");
      await loadAdminData();
      setMessage(locale === "ar" ? "تم حذف سؤال الاختبار" : "Question supprimée");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  return (
    <PageTransition>
      <div className="stack">
        <form className="card admin-form" onSubmit={createLesson}>
          <h2>{t.admin.createLesson}</h2>
          <div className="form-grid">
            <label className="field">
              <span>{t.admin.chooseSubject}</span>
              <select
                value={lessonForm.subjectId}
                onChange={(event) => setLessonForm((current) => ({ ...current, subjectId: event.target.value }))}
              >
                <option value="">{t.admin.chooseSubject}</option>
                {subjects.map((subject) => (
                  <option value={subject.id} key={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t.admin.lessonTitle}</span>
              <input
                value={lessonForm.title}
                onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </label>
            <label className="field">
              <span>{t.admin.lessonDescription}</span>
              <input
                value={lessonForm.description}
                onChange={(event) => setLessonForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>{t.admin.youtubeUrl}</span>
              <input
                value={lessonForm.youtubeUrl}
                onChange={(event) => setLessonForm((current) => ({ ...current, youtubeUrl: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>{t.admin.order}</span>
              <input
                type="number"
                value={lessonForm.order}
                onChange={(event) => setLessonForm((current) => ({ ...current, order: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>{t.admin.passPercent}</span>
              <input
                type="number"
                value={lessonForm.passingScore}
                onChange={(event) => setLessonForm((current) => ({ ...current, passingScore: event.target.value }))}
              />
            </label>
          </div>
          <button className="btn btn--primary" disabled={isBusy} type="submit">
            {isBusy ? <InlineLoader label="Saving..." /> : t.admin.addLesson}
          </button>
        </form>

        <form className="card admin-form" onSubmit={createQuizQuestion}>
          <h2>{t.admin.addQuizQuestion}</h2>
          <div className="form-grid">
            <label className="field">
              <span>{t.admin.chooseLesson}</span>
              <select
                value={quizForm.lessonId}
                onChange={(event) => setQuizForm((current) => ({ ...current, lessonId: event.target.value }))}
              >
                <option value="">{t.admin.chooseLesson}</option>
                {lessons.map((lesson) => (
                  <option value={lesson.id} key={lesson.id}>
                    {lesson.subject?.name || subjects.find((subject) => subject.id === lesson.subjectId)?.name} -{" "}
                    {lesson.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field form-grid__wide">
              <span>{t.admin.placementQuestion}</span>
              <input
                value={quizForm.question}
                onChange={(event) => setQuizForm((current) => ({ ...current, question: event.target.value }))}
                required
              />
            </label>
            {(["optionA", "optionB", "optionC", "optionD"] as const).map((field) => (
              <label className="field" key={field}>
                <span>{field.replace("option", "Option ")}</span>
                <input
                  value={quizForm[field]}
                  onChange={(event) => setQuizForm((current) => ({ ...current, [field]: event.target.value }))}
                  required
                />
              </label>
            ))}
            <label className="field">
              <span>{t.admin.correctAnswerText}</span>
              <select
                value={quizForm.correctAnswer}
                onChange={(event) =>
                  setQuizForm((current) => ({
                    ...current,
                    correctAnswer: event.target.value as AnswerOption,
                  }))
                }
              >
                {(["A", "B", "C", "D"] as AnswerOption[]).map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn btn--primary" disabled={isBusy} type="submit">
            {isBusy ? <InlineLoader label="Saving..." /> : t.admin.addQuizQuestion}
          </button>
        </form>

        {isLoading ? (
          <p className="muted">{t.admin.loading}</p>
        ) : (
          <div className="stack">
            {lessonsBySubject.map(({ subject, lessons: subjectLessons }) => (
              <article className="card" key={subject.id}>
                <div className="card__head">
                  <h2>{subject.name}</h2>
                  <button
                    className="btn btn--secondary"
                    onClick={() =>
                      setLessonForm((current) => ({
                        ...current,
                        subjectId: String(subject.id),
                        order: String(subjectLessons.length + 1),
                      }))
                    }
                    type="button"
                  >
                    {t.admin.addLesson}
                  </button>
                </div>

                {subjectLessons.length === 0 ? (
                  <p className="muted">{t.common.noLessons}</p>
                ) : (
                  <div className="stack">
                    {subjectLessons.map((lesson) => (
                      <div className="lesson-admin-card" key={lesson.id}>
                        <div className="lesson-admin-card__head">
                          <div>
                            <p className="eyebrow">
                              {t.lessonIndex.lessonPrefix} {lesson.order}
                            </p>
                            <h3>{lesson.title}</h3>
                            {lesson.description ? <p className="muted">{lesson.description}</p> : null}
                          </div>
                          <div className="button-row">
                            <button
                              className="btn btn--secondary"
                              onClick={() => setQuizForm((current) => ({ ...current, lessonId: String(lesson.id) }))}
                              type="button"
                            >
                              Add quiz here
                            </button>
                            <button className="btn btn--danger" onClick={() => deleteLesson(lesson.id)} type="button">
                              Delete lesson
                            </button>
                          </div>
                        </div>

                        <div className="quiz-admin-list">
                          {(lesson.quiz || lesson.questions || []).length === 0 ? (
                              <p className="muted">{t.common.noLessons}</p>
                          ) : (
                            (lesson.quiz || lesson.questions || []).map((question: QuizQuestion) => (
                              <div className="admin-row admin-row--stacked" key={question.id}>
                                <span>
                                  <strong>{question.question}</strong>
                                  <small>
                                    {t.admin.correctAnswerText}: {question.correctAnswer}
                                  </small>
                                </span>
                                <button
                                  className="btn btn--danger"
                                  onClick={() => deleteQuizQuestion(question.id)}
                                  type="button"
                                >
                                  {t.admin.delete}
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
