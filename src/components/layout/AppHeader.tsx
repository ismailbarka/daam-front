"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLocale, type Locale } from "@/lib/i18n";

const studentLinks = [
  { href: "/subjects", key: "subjects" as const },
  { href: "/placement", key: "placement" as const },
];

const adminLinks = [
  { href: "/admin/subjects", key: "adminSubjects" as const },
  { href: "/admin/lessons", key: "adminLessons" as const },
  { href: "/admin/placement", key: "adminPlacement" as const },
];

function LocaleButton({
  active,
  locale,
  onClick,
}: {
  active: boolean;
  locale: Locale;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`locale-switcher__button ${active ? "is-active" : ""}`} onClick={onClick}>
      {locale.toUpperCase()}
    </button>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const { user, logout, requiresPlacementTest } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const links =
    user?.role === "ADMIN"
      ? adminLinks
      : requiresPlacementTest
        ? studentLinks
        : studentLinks.filter((link) => link.href !== "/placement");
  const brandHref = user ? (user.role === "ADMIN" ? "/admin/subjects" : "/subjects") : "/";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={brandHref} className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L3 8.5V16.5L12 22L21 16.5V8.5L12 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M12 11V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M9.5 13.5H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="brand__text">
            <strong>{t.brand}</strong>
            <small>{t.brandTagline}</small>
          </span>
        </Link>

        {user && !isAuthPage ? (
          <nav className="site-nav" aria-label="Main">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav__link ${pathname.startsWith(link.href) ? "is-active" : ""}`}
              >
                {t.nav[link.key]}
              </Link>
            ))}
          </nav>
        ) : isPublicPage ? (
          <nav className="site-nav site-nav--public" aria-label="Public">
            <Link href="/" className={`site-nav__link ${pathname === "/" ? "is-active" : ""}`}>
              {t.nav.home}
            </Link>
          </nav>
        ) : null}

        <div className="site-header__actions">
          <div className="locale-switcher" aria-label={t.switchLabel}>
            <LocaleButton active={locale === "fr"} locale="fr" onClick={() => setLocale("fr")} />
            <LocaleButton active={locale === "ar"} locale="ar" onClick={() => setLocale("ar")} />
          </div>

          {user ? (
            <>
              <div className="user-chip">
                <span className="user-chip__avatar">{user.username.slice(0, 1).toUpperCase()}</span>
                <span className="user-chip__meta">
                  <strong>{user.username}</strong>
                  <small>{user.role === "ADMIN" ? t.role.admin : t.role.student}</small>
                </span>
              </div>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                {t.nav.signOut}
              </button>
            </>
          ) : isAuthPage ? (
            <>
              <Link href="/" className="btn btn--ghost">
                {t.nav.home}
              </Link>
              <Link href={pathname === "/login" ? "/signup" : "/login"} className="btn btn--primary">
                {pathname === "/login" ? t.nav.getStarted : t.nav.signIn}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn--ghost">
                {t.nav.signIn}
              </Link>
              <Link href="/signup" className="btn btn--primary">
                {t.nav.getStarted}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
