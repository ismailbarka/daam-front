"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { getErrorMessage, request } from "@/lib/api";
import type { PlacementTest } from "@/lib/types";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoadingOverlay, InlineLoader } from "@/components/layout/LoadingOverlay";
import { PageTransition } from "@/components/layout/PageTransition";

export default function PlacementPage() {
  const router = useRouter();
  const { token, authHeaders, isBusy, setStatus, setMessage, setRequiresPlacementTest } = useAuth();
  const { t } = useLocale();
  const [placementTests, setPlacementTests] = useState<PlacementTest[]>([]);
  const [placementAnswers, setPlacementAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setMessage("");

      try {
        const tests = await request<PlacementTest[]>("/placement-tests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPlacementTests(tests);
      } catch (error) {
        setMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    if (token) void load();
  }, [token, setMessage]);

  async function submitPlacement() {
    setStatus("loading");
    setMessage("");

    try {
      const submissions = placementTests.map((test) => ({
        placementTestId: test.id,
        answers: test.questions.map((question) => ({
          questionId: question.id,
          answer: placementAnswers[question.id],
        })),
      }));

      const missingAnswer = submissions.some((submission) =>
        submission.answers.some((answer) => !answer.answer),
      );

      if (missingAnswer) throw new Error("Please answer every placement question");

      await request("/placement-tests/submit-all", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ submissions }),
      });

      setRequiresPlacementTest(false);
      router.push("/subjects?placed=1");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  return (
    <RequireAuth role="STUDENT">
      {isLoading ? (
        <LoadingOverlay label={t.common.loadingPlacement} />
      ) : (
        <PageTransition>
          <section className="page-shell">
            <header className="page-header">
              <div>
                <p className="eyebrow">{t.common.chooseSubject}</p>
                <h1>{t.placement.title}</h1>
                <p className="page-header__lead">{t.placement.lead}</p>
              </div>
              <button className="btn btn--primary" disabled={isBusy} onClick={submitPlacement} type="button">
                {isBusy ? <InlineLoader label="Submitting..." /> : t.placement.submitAssessment}
              </button>
            </header>

            {placementTests.length === 0 ? (
              <div className="empty-state">{t.common.noPlacementTests}</div>
            ) : (
              <div className="stack">
                {placementTests.map((test, testIndex) => (
                  <article className="card placement-card" key={test.id} style={{ animationDelay: `${testIndex * 80}ms` }}>
                    <div className="card__head">
                      <h2>{test.subject?.name || `Placement test ${test.id}`}</h2>
                      <span className="pill">
                        {test.questions.length} {t.common.questions}
                      </span>
                    </div>
                    <div className="placement-questions">
                      {test.questions.map((question, index) => (
                        <div className="placement-question" key={question.id}>
                          <p>
                            <span className="placement-question__num">{index + 1}</span>
                            {question.text}
                          </p>
                          <div className="placement-options">
                            {question.options.map((option) => {
                              const selected = placementAnswers[question.id] === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  className={`placement-option ${selected ? "is-selected" : ""}`}
                                  onClick={() =>
                                    setPlacementAnswers((current) => ({
                                      ...current,
                                      [question.id]: option,
                                    }))
                                  }
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </PageTransition>
      )}
    </RequireAuth>
  );
}
