"use client";

import { useLocale } from "@/lib/i18n";

const labelMap: Record<string, { fr: string; ar: string }> = {
  "Checking session": { fr: "Vérification de la session", ar: "جارٍ التحقق من الجلسة" },
  "Redirecting": { fr: "Redirection", ar: "جارٍ التحويل" },
  "Restoring your session": { fr: "Restauration de la session", ar: "جارٍ استعادة الجلسة" },
  "Opening your dashboard": { fr: "Ouverture du tableau de bord", ar: "جارٍ فتح لوحة التحكم" },
  "Loading your subjects": { fr: "Chargement de vos matières", ar: "جارٍ تحميل موادك" },
  "Loading lesson list": { fr: "Chargement de la liste des leçons", ar: "جارٍ تحميل قائمة الدروس" },
  "Loading lesson": { fr: "Chargement de la leçon", ar: "جارٍ تحميل الدرس" },
  "Loading lessons": { fr: "Chargement des leçons", ar: "جارٍ تحميل الدروس" },
  "Loading placement test": { fr: "Chargement du test de placement", ar: "جارٍ تحميل اختبار التحديد" },
  "Loading placement tests": { fr: "Chargement des tests de placement", ar: "جارٍ تحميل اختبارات التحديد" },
  "Preparing your classroom": { fr: "Préparation de votre espace", ar: "جارٍ تجهيز مساحتك" },
  "Submitting...": { fr: "Envoi…", ar: "جارٍ الإرسال…" },
  "Saving...": { fr: "Enregistrement…", ar: "جارٍ الحفظ…" },
  "Submitting": { fr: "Envoi…", ar: "جارٍ الإرسال…" },
};

function localize(label: string, locale: "fr" | "ar") {
  return labelMap[label]?.[locale] || label;
}

export function LoadingOverlay({ label = "Loading" }: { label?: string }) {
  const { locale, t } = useLocale();
  const resolvedLabel =
    label === "Loading" ? t.common.loading : localize(label, locale) || label;

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={resolvedLabel}>
      <div className="loading-overlay__card">
        <div className="loading-orb" aria-hidden="true">
          <span className="loading-orb__ring" />
          <span className="loading-orb__core" />
          <span className="loading-orb__dot loading-orb__dot--one" />
          <span className="loading-orb__dot loading-orb__dot--two" />
        </div>
        <div className="loading-overlay__text">
          <p>{resolvedLabel}</p>
          <span>{t.common.preparingClassroom}</span>
        </div>
        <div className="loading-skeleton" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export function InlineLoader({ label = "Working..." }: { label?: string }) {
  const { locale } = useLocale();
  const resolvedLabel = localize(label, locale) || label;

  return (
    <span className="inline-loader" role="status" aria-live="polite">
      <span className="inline-loader__dot" aria-hidden="true" />
      {resolvedLabel}
    </span>
  );
}
