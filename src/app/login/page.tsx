"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthForm } from "@/components/auth/AuthForm";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

export default function LoginPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing || !user) return;
    router.replace(user.role === "ADMIN" ? "/admin/subjects" : "/subjects");
  }, [isInitializing, user, router]);

  if (isInitializing) {
    return <LoadingOverlay label="Checking session" />;
  }

  if (user) {
    return <LoadingOverlay label="Redirecting" />;
  }

  return (
    <AuthForm initialMode="login" switchHref="/signup" backHref="/" />
  );
}
