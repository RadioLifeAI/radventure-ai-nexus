
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ReportErrorModal } from "./ReportErrorModal";

interface ReportErrorButtonProps {
  caseId: string;
  caseTitle: string;
}

export function ReportErrorButton({ caseId, caseTitle }: ReportErrorButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Reportar Erro
      </Button>

      <ReportErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        caseId={caseId}
        caseTitle={caseTitle}
      />
    </>
  );
}
