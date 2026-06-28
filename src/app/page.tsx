"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3000";

type AuthMode = "login" | "signup";
type View = "auth" | "placement" | "subjects" | "lessons" | "admin";
type AdminTab = "subjects" | "lessons" | "placement";
type Status = "idle" | "loading";
type AnswerOption = "A" | "B" | "C" | "D";

type User = {
  id: number;
  username: string;
  role: "ADMIN" | "STUDENT" | string;
};

type Subject = {
  id: number;
  name: string;
};

type PlacementQuestion = {
  id: number;
  text: string;
  options: string[];
  correctAnswer?: string;
};

type PlacementTest = {
  id: number;
  subjectId: number;
  subject?: Subject;
  questions: PlacementQuestion[];
};

type QuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: AnswerOption;
};

type Lesson = {
  id: number;
  title: string;
  description?: string | null;
  youtubeUrl?: string | null;
  order: number;
  passingScore?: number;
  subjectId: number;
  subject?: Subject;
  status: "completed" | "unlocked" | "locked";
  quiz: QuizQuestion[];
  questions?: QuizQuestion[];
};

type QuizResult = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
};

type PlacementDraftQuestion = {
  text: string;
  optionsText: string;
  correctAnswer: string;
};

const emptyPlacementQuestion: PlacementDraftQuestion = {
  text: "",
  optionsText: "",
  correctAnswer: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined),
  );
}

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [view, setView] = useState<View>("auth");
  const [adminTab, setAdminTab] = useState<AdminTab>("subjects");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [placementTests, setPlacementTests] = useState<PlacementTest[]>([]);
  const [placementAnswers, setPlacementAnswers] = useState<Record<number, string>>({});
  const [placementLevels, setPlacementLevels] = useState<Record<string, unknown> | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>({});

  const [subjectName, setSubjectName] = useState("");
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
  const [placementForm, setPlacementForm] = useState({
    subjectId: "",
    questions: [{ ...emptyPlacementQuestion }],
  });

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  useEffect(() => {
    const savedToken = window.localStorage.getItem("edu_token");
    const savedUser = window.localStorage.getItem("edu_user");

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;

      /* eslint-disable react-hooks/set-state-in-effect */
      setToken(savedToken);
      setUser(parsedUser);
      /* eslint-enable react-hooks/set-state-in-effect */

      if (parsedUser.role === "ADMIN") {
        loadAdminData(savedToken);
      } else {
        loadSubjects(savedToken);
      }
    }
    // Run only once to restore a saved local session on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function request<T>(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const text = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
      throw new Error(text || "Request failed");
    }

    return data as T;
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (authMode === "signup") {
        await request<User>("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
      }

      const data = await request<{
        accessToken: string;
        requiresPlacementTest: boolean;
        nextStep: "admin" | "placement-test" | "subjects";
        user: User;
      }>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      setToken(data.accessToken);
      setUser(data.user);
      window.localStorage.setItem("edu_token", data.accessToken);
      window.localStorage.setItem("edu_user", JSON.stringify(data.user));

      if (data.nextStep === "admin" || data.user.role === "ADMIN") {
        await loadAdminData(data.accessToken);
      } else if (data.requiresPlacementTest) {
        await loadPlacementTests(data.accessToken);
      } else {
        await loadSubjects(data.accessToken);
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function loadPlacementTests(currentToken = token) {
    setStatus("loading");
    setMessage("");

    try {
      const tests = await request<PlacementTest[]>("/placement-tests", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setPlacementTests(tests);
      setView("placement");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

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

      const levels = await request<Record<string, unknown>>("/placement-tests/submit-all", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ submissions }),
      });

      setPlacementLevels(levels);
      await loadSubjects(token);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function loadSubjects(currentToken = token) {
    setStatus("loading");
    setMessage("");

    try {
      const data = await request<Subject[]>("/subjects", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setSubjects(data);
      setSelectedSubject(null);
      setLessons([]);
      setView("subjects");
    } catch (error) {
      const text = getErrorMessage(error);
      if (text.toLowerCase().includes("placement")) {
        await loadPlacementTests(currentToken);
      } else {
        setMessage(text);
      }
    } finally {
      setStatus("idle");
    }
  }

  async function openSubject(subject: Subject) {
    setStatus("loading");
    setMessage("");

    try {
      const data = await request<Lesson[]>(`/lessons?subjectId=${subject.id}`, {
        headers: authHeaders,
      });
      setSelectedSubject(subject);
      setLessons(data);
      setQuizAnswers({});
      setQuizResults({});
      setView("lessons");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function submitQuiz(lesson: Lesson) {
    setStatus("loading");
    setMessage("");

    try {
      const answers = lesson.quiz.map((question) => ({
        questionId: question.id,
        answer: quizAnswers[question.id],
      }));

      if (answers.some((answer) => !answer.answer)) throw new Error("Please answer every quiz question");

      const result = await request<QuizResult>(`/lessons/${lesson.id}/quiz/submit`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ answers }),
      });

      setQuizResults((current) => ({ ...current, [lesson.id]: result }));

      if (selectedSubject) {
        const updatedLessons = await request<Lesson[]>(`/lessons?subjectId=${selectedSubject.id}`, {
          headers: authHeaders,
        });
        setLessons(updatedLessons);
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function loadAdminData(currentToken = token) {
    setStatus("loading");
    setMessage("");

    try {
      const headers = { Authorization: `Bearer ${currentToken}` };
      const [subjectData, lessonData, placementData] = await Promise.all([
        request<Subject[]>("/subjects", { headers }),
        request<Lesson[]>("/lessons", { headers }),
        request<PlacementTest[]>("/placement-tests", { headers }),
      ]);

      setSubjects(subjectData);
      setLessons(lessonData);
      setPlacementTests(placementData);
      setView("admin");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await request<Subject>("/subjects", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ name: subjectName }),
      });
      setSubjectName("");
      await loadAdminData(token);
      setMessage("Subject created");
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
      await request<Subject>(`/subjects/${subjectId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      await loadAdminData(token);
      setMessage("Subject deleted");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      if (!lessonForm.subjectId) throw new Error("Choose a subject");

      await request<Lesson>("/lessons", {
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

      setLessonForm({
        subjectId: lessonForm.subjectId,
        title: "",
        description: "",
        youtubeUrl: "",
        order: "1",
        passingScore: "70",
      });
      await loadAdminData(token);
      setMessage("Lesson created");
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
      await request<Lesson>(`/lessons/${lessonId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      await loadAdminData(token);
      setMessage("Lesson deleted");
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

      await request<QuizQuestion>("/quiz/questions", {
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

      setQuizForm({
        lessonId: quizForm.lessonId,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      await loadAdminData(token);
      setMessage("Quiz question added");
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
      await request<QuizQuestion>(`/quiz/questions/${questionId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      await loadAdminData(token);
      setMessage("Quiz question deleted");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  async function createPlacementTest(event: FormEvent<HTMLFormElement>) {
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

      await request<PlacementTest>("/placement-tests", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          subjectId: Number(placementForm.subjectId),
          questions,
        }),
      });

      setPlacementForm({
        subjectId: placementForm.subjectId,
        questions: [{ ...emptyPlacementQuestion }],
      });
      await loadAdminData(token);
      setMessage("Placement test created");
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
      await request<PlacementTest>(`/placement-tests/${testId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      await loadAdminData(token);
      setMessage("Placement test deleted");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setStatus("idle");
    }
  }

  function setPlacementQuestion(index: number, field: keyof PlacementDraftQuestion, value: string) {
    setPlacementForm((current) => ({
      ...current,
      questions: current.questions.map((question, currentIndex) =>
        currentIndex === index ? { ...question, [field]: value } : question,
      ),
    }));
  }

  function logout() {
    window.localStorage.removeItem("edu_token");
    window.localStorage.removeItem("edu_user");
    setToken("");
    setUser(null);
    setView("auth");
    setUsername("");
    setPassword("");
    setMessage("");
    setPlacementTests([]);
    setSubjects([]);
    setLessons([]);
    setSelectedSubject(null);
  }

  const isBusy = status === "loading";
  const lessonsBySubject = subjects.map((subject) => ({
    subject,
    lessons: lessons.filter((lesson) => lesson.subjectId === subject.id),
  }));

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#15181e]">
      <header className="border-b border-[#d8dee8] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[#586174]">Edu Platform</p>
            <h1 className="text-2xl font-semibold">
              {user?.role === "ADMIN" ? "Admin dashboard" : "Student learning dashboard"}
            </h1>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[#586174] sm:inline">
                {user.username} ({user.role})
              </span>
              <button className="button secondary" onClick={logout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        {message ? (
          <div
            className={`notice ${
              message.includes("created") || message.includes("deleted") || message.includes("added")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        ) : null}

        {view === "auth" ? (
          <section className="auth-grid">
            <div className="panel intro-panel">
              <p className="eyebrow">Learn by level</p>
              <h2>Start with placement, then continue lesson by lesson.</h2>
              <p>
                Students follow placement and lesson progress. Admins manage subjects,
                lessons, quizzes, and placement tests from the same website.
              </p>
            </div>

            <form className="panel auth-panel" onSubmit={handleAuth}>
              <div className="segmented">
                <button
                  type="button"
                  className={authMode === "login" ? "active" : ""}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={authMode === "signup" ? "active" : ""}
                  onClick={() => setAuthMode("signup")}
                >
                  Signup
                </button>
              </div>

              <label>
                Username
                <input value={username} onChange={(event) => setUsername(event.target.value)} />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <button className="button primary full" disabled={isBusy}>
                {isBusy ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
              </button>
            </form>
          </section>
        ) : null}

        {view === "admin" ? (
          <section className="flow">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Admin</p>
                <h2>Manage the platform</h2>
              </div>
              <button className="button secondary" disabled={isBusy} onClick={() => loadAdminData()}>
                Refresh
              </button>
            </div>

            <div className="admin-tabs">
              {(["subjects", "lessons", "placement"] as AdminTab[]).map((tab) => (
                <button
                  key={tab}
                  className={adminTab === tab ? "active" : ""}
                  onClick={() => setAdminTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {adminTab === "subjects" ? (
              <div className="admin-grid">
                <form className="panel admin-form" onSubmit={createSubject}>
                  <h3>Create subject</h3>
                  <label>
                    Subject name
                    <input value={subjectName} onChange={(event) => setSubjectName(event.target.value)} />
                  </label>
                  <button className="button primary" disabled={isBusy}>
                    Add subject
                  </button>
                </form>

                <div className="panel">
                  <h3>Subjects</h3>
                  <div className="admin-list">
                    {subjects.map((subject) => (
                      <div className="admin-row" key={subject.id}>
                        <span>{subject.name}</span>
                        <button className="button danger" onClick={() => deleteSubject(subject.id)}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {adminTab === "lessons" ? (
              <div className="content-admin">
                <form className="panel admin-form" onSubmit={createLesson}>
                  <h3>Add lesson to a subject</h3>
                  <div className="form-grid">
                    <label>
                      Subject
                      <select
                        value={lessonForm.subjectId}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, subjectId: event.target.value }))
                        }
                      >
                        <option value="">Choose subject</option>
                        {subjects.map((subject) => (
                          <option value={subject.id} key={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Title
                      <input
                        value={lessonForm.title}
                        onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))}
                      />
                    </label>
                    <label>
                      Description
                      <input
                        value={lessonForm.description}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, description: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      YouTube URL
                      <input
                        value={lessonForm.youtubeUrl}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, youtubeUrl: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Order
                      <input
                        type="number"
                        value={lessonForm.order}
                        onChange={(event) => setLessonForm((current) => ({ ...current, order: event.target.value }))}
                      />
                    </label>
                    <label>
                      Pass %
                      <input
                        type="number"
                        value={lessonForm.passingScore}
                        onChange={(event) =>
                          setLessonForm((current) => ({ ...current, passingScore: event.target.value }))
                        }
                      />
                    </label>
                  </div>
                  <button className="button primary" disabled={isBusy}>
                    Add lesson
                  </button>
                </form>

                <form className="panel admin-form" onSubmit={createQuizQuestion}>
                  <h3>Add quiz question</h3>
                  <div className="form-grid">
                    <label>
                      Lesson
                      <select
                        value={quizForm.lessonId}
                        onChange={(event) => setQuizForm((current) => ({ ...current, lessonId: event.target.value }))}
                      >
                        <option value="">Choose lesson</option>
                        {lessons.map((lesson) => (
                          <option value={lesson.id} key={lesson.id}>
                            {lesson.subject?.name || subjects.find((subject) => subject.id === lesson.subjectId)?.name} -{" "}
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="wide">
                      Question
                      <input
                        value={quizForm.question}
                        onChange={(event) => setQuizForm((current) => ({ ...current, question: event.target.value }))}
                      />
                    </label>
                    {(["optionA", "optionB", "optionC", "optionD"] as const).map((field) => (
                      <label key={field}>
                        {field.replace("option", "Option ")}
                        <input
                          value={quizForm[field]}
                          onChange={(event) => setQuizForm((current) => ({ ...current, [field]: event.target.value }))}
                        />
                      </label>
                    ))}
                    <label>
                      Correct answer
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
                  <button className="button primary" disabled={isBusy}>
                    Add question
                  </button>
                </form>

                <div className="subject-content-list">
                  {lessonsBySubject.map(({ subject, lessons: subjectLessons }) => (
                    <article className="panel subject-content" key={subject.id}>
                      <div className="subject-content-head">
                        <h3>{subject.name}</h3>
                        <button
                          className="button secondary"
                          onClick={() =>
                            setLessonForm((current) => ({
                              ...current,
                              subjectId: String(subject.id),
                              order: String(subjectLessons.length + 1),
                            }))
                          }
                        >
                          Add lesson here
                        </button>
                      </div>

                      {subjectLessons.length === 0 ? (
                        <p className="muted">No lessons yet.</p>
                      ) : (
                        <div className="admin-list">
                          {subjectLessons.map((lesson) => (
                            <div className="lesson-admin-card" key={lesson.id}>
                              <div className="lesson-admin-head">
                                <div>
                                  <p className="eyebrow">Lesson {lesson.order}</p>
                                  <h4>{lesson.title}</h4>
                                  {lesson.description ? <p className="muted">{lesson.description}</p> : null}
                                </div>
                                <div className="button-row">
                                  <button
                                    className="button secondary"
                                    onClick={() =>
                                      setQuizForm((current) => ({ ...current, lessonId: String(lesson.id) }))
                                    }
                                  >
                                    Add quiz here
                                  </button>
                                  <button className="button danger" onClick={() => deleteLesson(lesson.id)}>
                                    Delete lesson
                                  </button>
                                </div>
                              </div>

                              <div className="quiz-admin-list">
                                {(lesson.quiz || lesson.questions || []).length === 0 ? (
                                  <p className="muted">No quiz questions yet.</p>
                                ) : (
                                  (lesson.quiz || lesson.questions || []).map((question) => (
                                    <div className="admin-row stacked" key={question.id}>
                                      <span>
                                        <strong>{question.question}</strong>
                                        Correct answer: {question.correctAnswer}
                                      </span>
                                      <button className="button danger" onClick={() => deleteQuizQuestion(question.id)}>
                                        Delete question
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
              </div>
            ) : null}

            {adminTab === "placement" ? (
              <div className="admin-grid">
                <form className="panel admin-form" onSubmit={createPlacementTest}>
                  <h3>Create placement test</h3>
                  <label>
                    Subject
                    <select
                      value={placementForm.subjectId}
                      onChange={(event) =>
                        setPlacementForm((current) => ({ ...current, subjectId: event.target.value }))
                      }
                    >
                      <option value="">Choose subject</option>
                      {subjects.map((subject) => (
                        <option value={subject.id} key={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {placementForm.questions.map((question, index) => (
                    <div className="draft-question" key={index}>
                      <label>
                        Question
                        <input
                          value={question.text}
                          onChange={(event) => setPlacementQuestion(index, "text", event.target.value)}
                        />
                      </label>
                      <label>
                        Options separated by commas
                        <input
                          value={question.optionsText}
                          onChange={(event) => setPlacementQuestion(index, "optionsText", event.target.value)}
                        />
                      </label>
                      <label>
                        Correct answer text
                        <input
                          value={question.correctAnswer}
                          onChange={(event) => setPlacementQuestion(index, "correctAnswer", event.target.value)}
                        />
                      </label>
                    </div>
                  ))}

                  <div className="button-row">
                    <button
                      className="button secondary"
                      type="button"
                      onClick={() =>
                        setPlacementForm((current) => ({
                          ...current,
                          questions: [...current.questions, { ...emptyPlacementQuestion }],
                        }))
                      }
                    >
                      Add another question
                    </button>
                    <button className="button primary" disabled={isBusy}>
                      Create test
                    </button>
                  </div>
                </form>

                <div className="panel">
                  <h3>Placement tests</h3>
                  <div className="admin-list">
                    {placementTests.map((test) => (
                      <div className="admin-row stacked" key={test.id}>
                        <span>
                          <strong>{test.subject?.name || `Subject ${test.subjectId}`}</strong>
                          {test.questions.length} questions
                        </span>
                        <button className="button danger" onClick={() => deletePlacementTest(test.id)}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {view === "placement" ? (
          <section className="flow">
            <div className="section-heading">
              <div>
                <p className="eyebrow">First login</p>
                <h2>Placement test</h2>
              </div>
              <button className="button primary" disabled={isBusy} onClick={submitPlacement}>
                Submit placement
              </button>
            </div>

            {placementTests.length === 0 ? (
              <div className="empty">No placement tests are available yet.</div>
            ) : (
              <div className="test-stack">
                {placementTests.map((test) => (
                  <article className="panel" key={test.id}>
                    <h3>{test.subject?.name || `Placement test ${test.id}`}</h3>
                    <div className="questions">
                      {test.questions.map((question, index) => (
                        <div className="question" key={question.id}>
                          <p>
                            {index + 1}. {question.text}
                          </p>
                          <div className="option-grid">
                            {question.options.map((option) => (
                              <label className="option" key={option}>
                                <input
                                  type="radio"
                                  name={`placement-${question.id}`}
                                  checked={placementAnswers[question.id] === option}
                                  onChange={() =>
                                    setPlacementAnswers((current) => ({
                                      ...current,
                                      [question.id]: option,
                                    }))
                                  }
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {view === "subjects" ? (
          <section className="flow">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Subjects</p>
                <h2>Choose a subject</h2>
              </div>
            </div>

            {placementLevels ? (
              <div className="notice success">Placement completed. Your subjects are ready.</div>
            ) : null}

            {subjects.length === 0 ? (
              <div className="empty">No subjects are available yet.</div>
            ) : (
              <div className="subject-grid">
                {subjects.map((subject) => (
                  <button className="subject-card" key={subject.id} onClick={() => openSubject(subject)}>
                    <span>{subject.name}</span>
                    <strong>Open</strong>
                  </button>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {view === "lessons" && selectedSubject ? (
          <section className="flow">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{selectedSubject.name}</p>
                <h2>Lessons</h2>
              </div>
              <button className="button secondary" onClick={() => loadSubjects()}>
                Subjects
              </button>
            </div>

            {lessons.length === 0 ? (
              <div className="empty">No lessons are available for this subject yet.</div>
            ) : (
              <div className="lesson-list">
                {lessons.map((lesson) => {
                  const locked = lesson.status === "locked";
                  const result = quizResults[lesson.id];

                  return (
                    <article className={`panel lesson ${locked ? "locked" : ""}`} key={lesson.id}>
                      <div className="lesson-head">
                        <div>
                          <p className="eyebrow">Lesson {lesson.order}</p>
                          <h3>{lesson.title}</h3>
                        </div>
                        <span className={`badge ${lesson.status}`}>{lesson.status}</span>
                      </div>

                      {lesson.description ? <p className="muted">{lesson.description}</p> : null}

                      {lesson.youtubeUrl && !locked ? (
                        <a className="video-link" href={lesson.youtubeUrl} target="_blank" rel="noreferrer">
                          Watch lesson
                        </a>
                      ) : null}

                      {!locked ? (
                        <div className="quiz">
                          {lesson.quiz.length === 0 ? (
                            <p className="muted">No quiz is attached to this lesson yet.</p>
                          ) : (
                            lesson.quiz.map((question, index) => (
                              <div className="question" key={question.id}>
                                <p>
                                  {index + 1}. {question.question}
                                </p>
                                <div className="option-grid">
                                  {[
                                    ["A", question.optionA],
                                    ["B", question.optionB],
                                    ["C", question.optionC],
                                    ["D", question.optionD],
                                  ].map(([key, label]) => (
                                    <label className="option" key={key}>
                                      <input
                                        type="radio"
                                        name={`quiz-${question.id}`}
                                        checked={quizAnswers[question.id] === key}
                                        onChange={() =>
                                          setQuizAnswers((current) => ({
                                            ...current,
                                            [question.id]: key,
                                          }))
                                        }
                                      />
                                      <span>
                                        {key}. {label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}

                          {lesson.quiz.length > 0 ? (
                            <button
                              className="button primary"
                              disabled={isBusy}
                              onClick={() => submitQuiz(lesson)}
                            >
                              Submit quiz
                            </button>
                          ) : null}

                          {result ? (
                            <div className={`notice ${result.passed ? "success" : "error"}`}>
                              Score: {result.score}% ({result.correct}/{result.total}) -{" "}
                              {result.passed ? "Passed" : "Try again"}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="muted">Complete the previous lesson to unlock this lesson.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  );
}
