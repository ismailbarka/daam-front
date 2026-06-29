"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/api";
import type { PlacementDraftQuestion, PlacementTest, Subject } from "@/lib/types";
import { InlineLoader } from "@/components/layout/LoadingOverlay";
import { PageTransition } from "@/components/layout/PageTransition";

const emptyPlacementQuestion: PlacementDraftQuestion = {
  text: "",
  optionsText: "",
  correctAnswer: "",
};

export default function AdminPlacementPage() {
  const { authHeaders, isBusy, setStatus, setMessage } = useAuth();
  const { locale, t } = useLocale();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [placementTests, setPlacementTests] = useState<PlacementTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [placementForm, setPlacementForm] = useState({
    subjectId: "",
    questions: [{ ...emptyPlacementQuestion }],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [subjectResponse, placementResponse] = await Promise.all([
        fetch("https://edu-platform-backend-one.vercel.app/subjects", { headers: authHeaders }),
        fetch("https://edu-platform-backend-one.vercel.app/placement-tests", { headers: authHeaders }),
      ]);
      const subjectData = await subjectResponse.json().catch(() => null);
      const placementData = await placementResponse.json().catch(() => null);
      if (!subjectResponse.ok) throw new Error(subjectData?.message || "Request failed");
      if (!placementResponse.ok) throw new Error(placementData?.message || "Request failed");
      setSubjects(subjectData as Subject[]);
      setPlacementTests(placementData as PlacementTest[]);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, setMessage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  function setPlacementQuestion(index: number, field: keyof PlacementDraftQuestion, value: string) {
    setPlacementForm((current) => ({
      ...current,
      questions: current.questions.map((question, currentIndex) =>
        currentIndex === index ? { ...question, [field]: value } : question,
      ),
    }));
  }

  async function createPlacementTest(event: { preventDefault: () => void }) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (!placementForm.subjectId) throw new Error("Choose a subject");

      const questions = placementForm.questions.map((question) => {
        const options = question.optionsText
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean);

        if (!question.text || options.length < 2 || !question.correctAnswer) {
          throw new Error("Each placement question needs text, at least two options, and a correct answer");
        }

        return {
          text: question.text,
          options,
          correctAnswer: question.correctAnswer,
        };
      });

      const response = await fetch("https://edu-platform-backend-one.vercel.app/placement-tests", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          subjectId: Number(placementForm.subjectId),
          questions,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");

      setPlacementForm({
        subjectId: placementForm.subjectId,
        questions: [{ ...emptyPlacementQuestion }],
      });
      await loadData();
      setMessage(locale === "ar" ? "تم إنشاء اختبار التحديد" : "Test de placement créé");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function deletePlacementTest(testId: number) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`https://edu-platform-backend-one.vercel.app/placement-tests/${testId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");
      await loadData();
      setMessage(locale === "ar" ? "تم حذف اختبار التحديد" : "Test de placement supprimé");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  return (
    <PageTransition>
      <div className="admin-grid">
        <form className="card admin-form" onSubmit={createPlacementTest}>
          <h2>{t.admin.addPlacementTest}</h2>
          <label className="field">
            <span>{t.admin.chooseSubject}</span>
            <select
              value={placementForm.subjectId}
              onChange={(event) => setPlacementForm((current) => ({ ...current, subjectId: event.target.value }))}
            >
              <option value="">{t.admin.chooseSubject}</option>
              {subjects.map((subject) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          {placementForm.questions.map((question, index) => (
            <div className="draft-question" key={index}>
              <label className="field">
                <span>{t.admin.placementQuestion}</span>
                <input
                  value={question.text}
                  onChange={(event) => setPlacementQuestion(index, "text", event.target.value)}
                />
              </label>
              <label className="field">
                <span>{t.admin.optionsSeparated}</span>
                <input
                  value={question.optionsText}
                  onChange={(event) => setPlacementQuestion(index, "optionsText", event.target.value)}
                />
              </label>
              <label className="field">
                <span>{t.admin.correctAnswerText}</span>
                <input
                  value={question.correctAnswer}
                  onChange={(event) => setPlacementQuestion(index, "correctAnswer", event.target.value)}
                />
              </label>
            </div>
          ))}

          <div className="button-row">
            <button
              className="btn btn--secondary"
              type="button"
              onClick={() =>
                setPlacementForm((current) => ({
                  ...current,
                  questions: [...current.questions, { ...emptyPlacementQuestion }],
                }))
              }
            >
              {t.admin.addAnotherQuestion}
            </button>
            <button className="btn btn--primary" disabled={isBusy} type="submit">
              {isBusy ? <InlineLoader label="Saving..." /> : t.admin.createPlacementTest}
            </button>
          </div>
        </form>

        <div className="card">
          <div className="card__head">
            <h2>{t.admin.tests}</h2>
            <button className="btn btn--ghost" disabled={isBusy} onClick={() => loadData()} type="button">
              {t.admin.refresh}
            </button>
          </div>
          {isLoading ? (
            <p className="muted">{t.admin.loading}</p>
          ) : placementTests.length === 0 ? (
            <p className="muted">{t.common.noPlacementTests}</p>
          ) : (
            <div className="admin-list">
              {placementTests.map((test) => (
                <div className="admin-row admin-row--stacked" key={test.id}>
                  <span>
                    <strong>{test.subject?.name || `Subject ${test.subjectId}`}</strong>
                    <small>
                      {test.questions.length} {t.common.questions}
                    </small>
                  </span>
                  <button className="btn btn--danger" onClick={() => deletePlacementTest(test.id)} type="button">
                    {t.admin.delete}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
