"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useLocale();

  return (
    <main className="landing">
      <div className="landing__glow landing__glow--one" aria-hidden="true" />
      <div className="landing__glow landing__glow--two" aria-hidden="true" />
      <div className="landing__glow landing__glow--three" aria-hidden="true" />

      <section className="landing__content page-enter">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{t.home.eyebrow}</p>
            <h1>{t.home.title}</h1>
            <p className="landing__lead">{t.home.lead}</p>

            <div className="landing__actions">
              <Link href="/signup" className="btn btn--primary btn--lg">
                {t.home.createAccount}
              </Link>
              <Link href="/login" className="btn btn--secondary btn--lg">
                {t.home.signIn}
              </Link>
              <Link href="/subjects" className="btn btn--ghost btn--lg">
                {t.home.browseSubjects}
              </Link>
            </div>

            <div className="landing__highlights">
              {t.landing.highlightValues.map((value, index) => (
                <div className="highlight-chip" key={value}>
                  <strong>{value}</strong>
                  <span>{t.landing.highlightLabels[index]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel__top">
              <span className="hero-panel__badge">{t.home.heroBadge}</span>
              <div className="hero-panel__score">
                <strong>98%</strong>
                <span className="muted">{t.home.heroScore}</span>
              </div>
            </div>

            <div className="hero-panel__timeline">
              {t.home.heroSteps.map((step, index) => (
                <div className={`timeline-step ${index === 0 ? "is-active" : ""}`} key={step}>
                  <span>0{index + 1}</span>
                  <div>
                    <strong>{step}</strong>
                    <p>{t.landing.steps[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-block">
          <div className="section-heading">
            <p className="eyebrow">{t.home.builtFor}</p>
            <h2>{t.home.builtTitle}</h2>
          </div>

          <div className="landing__cards">
            {t.home.builtCards.map((copy, index) => (
              <article className="feature-card" key={copy}>
                <span className="feature-card__index">0{index + 1}</span>
                <h2>{t.home.heroSteps[index]}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="section-block section-block--split">
          <div className="quote-card">
            <p className="eyebrow">{t.home.teacherEyebrow}</p>
            <h2>{t.home.teacherTitle}</h2>
            <p>{t.home.teacherCopy}</p>
          </div>

          <div className="note-card">
            <p className="eyebrow">{t.home.whatFeelsBetter}</p>
            <ul>
              {t.home.betterItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <p>© {new Date().getFullYear()} {t.common.copyright}. {t.common.allRightsReserved}.</p>
        </footer>
      </section>
    </main>
  );
}
