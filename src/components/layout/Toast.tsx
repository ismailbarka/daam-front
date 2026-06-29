"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

export function Toast() {
  const { message, setMessage } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Clear message in context to allow triggering again on the same message
        setTimeout(() => setMessage(""), 300);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [message, setMessage]);

  if (!message || !visible) return null;

  const lowerMsg = message.toLowerCase();
  const isSuccess =
    lowerMsg.includes("created") ||
    lowerMsg.includes("deleted") ||
    lowerMsg.includes("added") ||
    lowerMsg.includes("completed") ||
    lowerMsg.includes("créé") ||
    lowerMsg.includes("supprimé") ||
    lowerMsg.includes("ajouté") ||
    lowerMsg.includes("complété") ||
    lowerMsg.includes("succès") ||
    lowerMsg.includes("تم") ||
    lowerMsg.includes("ناجح") ||
    lowerMsg.includes("إنشاء") ||
    lowerMsg.includes("حذف") ||
    lowerMsg.includes("إضافة");

  return (
    <div className={`toast ${isSuccess ? "toast--success" : "toast--error"}`} role="alert">
      {message}
    </div>
  );
}
