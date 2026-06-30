"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { API_URL } from "@/lib/api";
import { getErrorMessage } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { InlineLoader } from "@/components/layout/LoadingOverlay";
import { PageTransition } from "@/components/layout/PageTransition";

export default function AdminSubjectsPage() {
  const { authHeaders, isBusy, setStatus, setMessage } = useAuth();
  const { locale, t } = useLocale();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        headers: authHeaders,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");
      setSubjects(data as Subject[]);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, setMessage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSubjects();
  }, [loadSubjects]);

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name: subjectName }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");
      setSubjectName("");
      await loadSubjects();
      setMessage(locale === "ar" ? "تم إنشاء المادة" : "Matière créée");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function deleteSubject(subjectId: number) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Request failed");
      await loadSubjects();
      setMessage(locale === "ar" ? "تم حذف المادة" : "Matière supprimée");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  return (
    <PageTransition>
      <div className="admin-grid">
        <form className="card admin-form" onSubmit={createSubject}>
          <h2>{t.admin.createSubject}</h2>
          <label className="field">
            <span>{t.admin.subjectName}</span>
            <input value={subjectName} onChange={(event) => setSubjectName(event.target.value)} required />
          </label>
          <button className="btn btn--primary" disabled={isBusy} type="submit">
            {isBusy ? <InlineLoader label="Saving..." /> : t.admin.addSubject}
          </button>
        </form>

        <div className="card">
          <div className="card__head">
            <h2>{t.admin.subjects}</h2>
            <button className="btn btn--ghost" disabled={isBusy} onClick={() => loadSubjects()} type="button">
              {t.admin.refresh}
            </button>
          </div>
          {isLoading ? (
            <p className="muted">{t.admin.loading}</p>
          ) : subjects.length === 0 ? (
            <p className="muted">{t.common.noSubjects}</p>
          ) : (
            <div className="admin-list">
              {subjects.map((subject) => (
                <div className="admin-row" key={subject.id}>
                  <span>{subject.name}</span>
                  <button className="btn btn--danger" onClick={() => deleteSubject(subject.id)} type="button">
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
