"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { LocaleProvider } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/AppHeader";
import { Toast } from "@/components/layout/Toast";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AppHeader />
        <Toast />
        <main className="app-main">{children}</main>
      </AuthProvider>
    </LocaleProvider>
  );
}
