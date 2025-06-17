
import React from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";

export default function CasosMedicos() {
  return (
    <div className="space-y-6">
      <CasesManagementHeader />
      <div className="bg-white rounded-lg shadow-lg">
        <CaseProfileForm />
      </div>
    </div>
  );
}
