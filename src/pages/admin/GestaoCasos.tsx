
import React, { useState } from "react";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { CasesAdvancedFilters } from "./components/CasesAdvancedFilters";
import { CasesViewSelector, ViewMode } from "./components/CasesViewSelector";
import { CasesCardsView } from "./components/CasesCardsView";
import { CasesGridView } from "./components/CasesGridView";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { CaseEditFormModal } from "./components/CaseEditFormModal";
import { useCasesManagement } from "./hooks/useCasesManagement";
import { useDisclosure } from "@mantine/hooks";
import { Loader } from "@/components/Loader";

export default function GestaoCasos() {
  const {
    cases,
    totalCases,
    loading,
    selectedCases,
    filters,
    setFilters,
    savedFilters,
    handleSaveFilter,
    handleLoadFilter,
    viewMode,
    setViewMode,
    sortField,
    sortDirection,
    handleSort,
    gridDensity,
    setGridDensity,
    handleCaseSelect,
    handleSelectAll,
    handleBulkAction,
    handleExport,
    deleteCase,
    refetch
  } = useCasesManagement();

  const [editModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleEdit = (caseId: string) => {
    setSelectedCaseId(caseId);
    openEditModal();
  };

  const handleView = (caseId: string) => {
    // Implementar modal de visualização
    console.log("Visualizar caso:", caseId);
  };

  const handleDuplicate = (caseId: string) => {
    // Implementar duplicação
    console.log("Duplicar caso:", caseId);
  };

  const handleCaseSaved = () => {
    refetch();
    closeEditModal();
  };

  const renderCasesView = () => {
    if (loading) {
      return <Loader />;
    }

    switch (viewMode) {
      case "cards":
        return (
          <CasesCardsView
            cases={cases}
            selectedCases={selectedCases}
            onCaseSelect={handleCaseSelect}
            onEdit={handleEdit}
            onDelete={deleteCase}
            onDuplicate={handleDuplicate}
            onView={handleView}
          />
        );
      case "grid":
        return (
          <CasesGridView
            cases={cases}
            selectedCases={selectedCases}
            onCaseSelect={handleCaseSelect}
            onEdit={handleEdit}
            onView={handleView}
            density={gridDensity}
          />
        );
      case "table":
        return (
          <MedicalCasesTable
            cases={cases}
            onDelete={deleteCase}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navegação */}
      <div className="flex items-center justify-between">
        <BackToDashboard variant="back" />
        <div className="text-sm text-gray-500">
          {cases.length} de {totalCases} casos exibidos
        </div>
      </div>

      <CasesManagementHeader />

      {/* Filtros Avançados */}
      <CasesAdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSaveFilter={handleSaveFilter}
        savedFilters={savedFilters}
        onLoadFilter={handleLoadFilter}
        totalCases={totalCases}
        filteredCases={cases.length}
      />

      {/* Seletor de Visualização */}
      <CasesViewSelector
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectedCount={selectedCases.length}
        totalCount={cases.length}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        gridDensity={gridDensity}
        onGridDensityChange={setGridDensity}
      />

      {/* Visualização dos Casos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderCasesView()}
      </div>

      {/* Modal de Edição */}
      <CaseEditFormModal
        open={editModalOpen}
        onClose={closeEditModal}
        caseId={selectedCaseId}
        onSaved={handleCaseSaved}
      />
    </div>
  );
}
