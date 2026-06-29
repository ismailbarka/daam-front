"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(user.role === "ADMIN" ? "/admin/subjects" : "/subjects");
  }, [isInitializing, user, router]);

  return <LoadingOverlay label="Opening your dashboard" />;
}
