
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CaseEditFormModal } from "./CaseEditFormModal";
import { CaseViewerAdminModal } from "./CaseViewerAdminModal";
import { CasePreviewModal } from "./CasePreviewModal";

type Case = {
  id: string;
  title: string;
  specialty: string;
  modality: string;
  difficulty_level: number;
  points: number;
  created_at: string;
  case_number: number;
};

type MedicalCasesTableProps = {
  cases: Case[];
  onDelete: (id: string) => void;
};

export function MedicalCasesTable({ cases, onDelete }: MedicalCasesTableProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleEdit = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowEditModal(true);
  };

  const handleView = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowViewModal(true);
  };

  const handlePreview = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowPreviewModal(true);
  };

  const handleCloseModals = () => {
    setSelectedCaseId(null);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowPreviewModal(false);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Título</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Especialidade</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Modalidade</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Dificuldade</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Pontos</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Criado em</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((caso) => (
            <tr key={caso.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 font-semibold">
                {caso.title}
              </td>
              <td className="border border-gray-300 px-4 py-2">{caso.specialty}</td>
              <td className="border border-gray-300 px-4 py-2">{caso.modality}</td>
              <td className="border border-gray-300 px-4 py-2">{caso.difficulty_level}</td>
              <td className="border border-gray-300 px-4 py-2">{caso.points}</td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(caso.created_at).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(caso.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(caso.id)}
                  >
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(caso.id)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(caso.id)}
                  >
                    Deletar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CaseEditFormModal
        open={showEditModal}
        onClose={handleCloseModals}
        caseId={selectedCaseId}
        onSaved={handleCloseModals}
      />

      <CaseViewerAdminModal
        open={showViewModal}
        onClose={handleCloseModals}
        caseId={selectedCaseId}
      />

      {selectedCaseId && (
        <CasePreviewModal
          open={showPreviewModal}
          onClose={handleCloseModals}
          caseId={selectedCaseId}
        />
      )}
    </div>
  );
}
