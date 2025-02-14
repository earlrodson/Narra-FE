// pages/validate.js (Main Page Component with Suspense)
import { Suspense } from "react";
import ValidatePageContent from "./content";

export default function ValidatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ValidatePageContent />
    </Suspense>
  );
}