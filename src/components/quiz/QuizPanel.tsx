"use client";

import type { QuizQuestion, QuizResult } from "@/lib/types";
import { InlineLoader } from "@/components/layout/LoadingOverlay";
import { useLocale } from "@/lib/i18n";

type QuizPanelProps = {
  questions: QuizQuestion[];
  answers: Record<number, string>;
  onAnswer: (questionId: number, answer: string) => void;
  onSubmit: () => void;
  isBusy: boolean;
  result?: QuizResult;
  disabled?: boolean;
};

export function QuizPanel({
  questions,
  answers,
  onAnswer,
  onSubmit,
  isBusy,
  result,
  disabled = false,
}: QuizPanelProps) {
  const { t } = useLocale();
  if (questions.length === 0) {
    return <p className="muted">{t.common.noLessons}</p>;
  }

  const answeredCount = questions.filter((question) => answers[question.id]).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="quiz-panel">
      <div className="quiz-panel__head">
        <div>
          <p className="eyebrow">{t.lessonDetail.title}</p>
          <h4>{t.admin.addQuizQuestion}</h4>
          <p className="quiz-panel__copy">
            {t.lessonDetail.lead}
          </p>
        </div>
        <div className="quiz-progress" aria-label={`${answeredCount} of ${questions.length} answered`}>
          <div className="quiz-progress__bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>
            {answeredCount}/{questions.length} answered
          </small>
        </div>
      </div>

      <div className="quiz-questions">
        {questions.map((question, index) => (
          <article className="quiz-question" key={question.id}>
            <div className="quiz-question__index">{index + 1}</div>
            <div className="quiz-question__content">
              <p>{question.question}</p>
              <div className="quiz-options">
                {(
                  [
                    ["A", question.optionA],
                    ["B", question.optionB],
                    ["C", question.optionC],
                    ["D", question.optionD],
                  ] as const
                ).map(([key, label]) => {
                  const selected = answers[question.id] === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`quiz-option ${selected ? "is-selected" : ""}`}
                      disabled={disabled || isBusy}
                      aria-pressed={selected}
                      onClick={() => onAnswer(question.id, key)}
                    >
                      <span className="quiz-option__key">{key}</span>
                      <span className="quiz-option__label">{label}</span>
                      <span className="quiz-option__check" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="quiz-panel__footer">
        <button className="btn btn--primary" disabled={disabled || isBusy} onClick={onSubmit} type="button">
          {isBusy ? <InlineLoader label="Submitting..." /> : t.common.submitting}
        </button>

        {result ? (
          <div className={`quiz-result ${result.passed ? "quiz-result--pass" : "quiz-result--fail"}`}>
            <strong>{result.passed ? t.common.completedLabel : t.common.lockedLabel}</strong>
            <span>
              Score {result.score}% · {result.correct}/{result.total} correct
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
