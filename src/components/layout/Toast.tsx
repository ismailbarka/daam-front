"use client";

import { useAuth } from "@/lib/auth-context";

export function Toast() {
  const { message } = useAuth();
  if (!message) return null;

  const isSuccess =
    message.includes("created") ||
    message.includes("deleted") ||
    message.includes("added") ||
    message.includes("completed");

  return (
    <div className={`toast ${isSuccess ? "toast--success" : "toast--error"}`} role="alert">
      {message}
    </div>
  );
}
