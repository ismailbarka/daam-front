"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { AuthMode } from "@/lib/types";
import { useLocale } from "@/lib/i18n";
import { FadeIn, PageTransition } from "@/components/layout/PageTransition";
import { InlineLoader } from "@/components/layout/LoadingOverlay";

type AuthFormProps = {
  initialMode?: AuthMode;
  switchHref?: string;
  backHref?: string;
};

export function AuthForm({ initialMode = "login", switchHref, backHref = "/" }: AuthFormProps) {
  const { login, register, isBusy } = useAuth();
  const { locale, t } = useLocale();
  const [authMode] = useState<AuthMode>(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authMode === "login") {
      await login(username, password);
    } else {
      await register(username, password);
    }
  }

  const isLogin = authMode === "login";
  const heroBullets = isLogin ? t.auth.loginHero : t.auth.signupHero;

  return (
    <PageTransition>
      <section className="auth-shell">
        <FadeIn>
          <div className="auth-hero">
            <span className="auth-hero__badge">{isLogin ? t.auth.loginEyebrow : t.auth.signupEyebrow}</span>
            <p className="eyebrow">{locale === "fr" ? "Apprentissage personnalisé" : "تعلم مخصص"}</p>
            <h1>{isLogin ? t.auth.loginTitle : t.auth.signupTitle}</h1>
            <p className="auth-hero__copy">{isLogin ? t.auth.loginCopy : t.auth.signupCopy}</p>
            <div className="auth-hero__stats">
              <div className="stat-card">
                <strong>01</strong>
                <span>{heroBullets[0]}</span>
              </div>
              <div className="stat-card">
                <strong>02</strong>
                <span>{heroBullets[1]}</span>
              </div>
              <div className="stat-card">
                <strong>03</strong>
                <span>{heroBullets[2]}</span>
              </div>
            </div>
            <ul className="auth-hero__features">
              {(isLogin ? t.home.betterItems : t.home.betterItems).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-tabs" aria-hidden="true">
              <span className="auth-tabs__label is-active">{isLogin ? t.nav.signIn : t.nav.getStarted}</span>
              <span className="auth-tabs__label">{isLogin ? t.auth.joinClassroom : t.auth.securePortal}</span>
              <span className="auth-tabs__indicator" data-mode={authMode} aria-hidden="true" />
            </div>

            <div className="auth-card__body">
              <div className="auth-card__intro">
                <p className="auth-card__eyebrow">{isLogin ? t.auth.loginIntroEyebrow : t.auth.signupIntroEyebrow}</p>
                <h2>{isLogin ? t.auth.loginIntroTitle : t.auth.signupIntroTitle}</h2>
                <p>{isLogin ? t.auth.loginIntroCopy : t.auth.signupIntroCopy}</p>
              </div>

              <label className="field">
                <span>{t.auth.username}</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </label>

              <label className="field">
                <span>{t.auth.password}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  required
                />
              </label>

              <button className="btn btn--primary btn--block" disabled={isBusy} type="submit">
                {isBusy ? (
                  <InlineLoader label={isLogin ? "Signing in..." : "Saving..."} />
                ) : isLogin ? (
                  t.nav.signIn
                ) : (
                  t.nav.getStarted
                )}
              </button>

              <p className="auth-card__footer">
                {isLogin ? t.auth.newHere : t.auth.alreadyHave}{" "}
                {switchHref ? (
                  <Link href={switchHref} className="text-link">
                    {isLogin ? t.auth.switchToSignup : t.auth.switchToLogin}
                  </Link>
                ) : null}
              </p>
            </div>
          </form>
        </FadeIn>

        <p className="auth-back">
          <Link href={backHref}>{t.auth.backHome}</Link>
        </p>
      </section>
    </PageTransition>
  );
}
