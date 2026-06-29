"use client";

import { Suspense } from "react";
import SubjectsContent from "./SubjectsContent";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

export default function SubjectsPage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading your subjects" />}>
      <SubjectsContent />
    </Suspense>
  );
}
