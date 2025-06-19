
import React, { useState } from "react";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { CasesAdvancedFilters } from "./components/CasesAdvancedFilters";
import { CasesViewSelector, ViewMode } from "./components/CasesViewSelector";
import { CasesCardsView } from "./components/CasesCardsView";
import { CasesGridView } from "./components/CasesGridView";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { CaseEditFormModal } from "./components/CaseEditFormModal";
import { CaseQuickEditModal } from "./components/CaseQuickEditModal";
import { CaseRichViewModal } from "./components/CaseRichViewModal";
import { CaseSmartDuplicateModal } from "./components/CaseSmartDuplicateModal";
import { CaseAdvancedAnalyticsModal } from "./components/CaseAdvancedAnalyticsModal";
import { CaseEditWizardModal } from "./components/CaseEditWizardModal";
import { CaseVersionComparisonModal } from "./components/CaseVersionComparisonModal";
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

  // Modal states - Phase 1
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [quickEditModalOpen, { open: openQuickEditModal, close: closeQuickEditModal }] = useDisclosure(false);
  const [richViewModalOpen, { open: openRichViewModal, close: closeRichViewModal }] = useDisclosure(false);
  const [duplicateModalOpen, { open: openDuplicateModal, close: closeDuplicateModal }] = useDisclosure(false);
  
  // Modal states - Phase 2
  const [analyticsModalOpen, { open: openAnalyticsModal, close: closeAnalyticsModal }] = useDisclosure(false);
  const [wizardModalOpen, { open: openWizardModal, close: closeWizardModal }] = useDisclosure(false);
  const [versionModalOpen, { open: openVersionModal, close: closeVersionModal }] = useDisclosure(false);
  
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleEdit = (caseId: string) => {
    setSelectedCaseId(caseId);
    openEditModal();
  };

  const handleQuickEdit = (caseId: string) => {
    setSelectedCaseId(caseId);
    openQuickEditModal();
  };

  const handleView = (caseId: string) => {
    setSelectedCaseId(caseId);
    openRichViewModal();
  };

  const handleDuplicate = (caseId: string) => {
    setSelectedCaseId(caseId);
    openDuplicateModal();
  };

  // Phase 2 handlers
  const handleAnalytics = (caseId: string) => {
    setSelectedCaseId(caseId);
    openAnalyticsModal();
  };

  const handleWizardEdit = (caseId: string) => {
    setSelectedCaseId(caseId);
    openWizardModal();
  };

  const handleVersionComparison = (caseId: string) => {
    setSelectedCaseId(caseId);
    openVersionModal();
  };

  const handleCaseSaved = () => {
    refetch();
    closeEditModal();
    closeQuickEditModal();
    closeWizardModal();
  };

  const handleCaseCreated = () => {
    refetch();
    closeDuplicateModal();
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
            onAnalytics={handleAnalytics}
            onWizardEdit={handleWizardEdit}
            onVersionComparison={handleVersionComparison}
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
            onAnalytics={handleAnalytics}
            onWizardEdit={handleWizardEdit}
            onVersionComparison={handleVersionComparison}
            density={gridDensity}
          />
        );
      case "table":
        return (
          <MedicalCasesTable
            cases={cases}
            onDelete={deleteCase}
            onAnalytics={handleAnalytics}
            onWizardEdit={handleWizardEdit}
            onVersionComparison={handleVersionComparison}
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

      {/* Modais - Phase 1 */}
      <CaseEditFormModal
        open={editModalOpen}
        onClose={closeEditModal}
        caseId={selectedCaseId}
        onSaved={handleCaseSaved}
      />

      <CaseQuickEditModal
        open={quickEditModalOpen}
        onClose={closeQuickEditModal}
        caseId={selectedCaseId}
        onSaved={handleCaseSaved}
      />

      <CaseRichViewModal
        open={richViewModalOpen}
        onClose={closeRichViewModal}
        caseId={selectedCaseId}
        onEdit={handleQuickEdit}
        onDuplicate={handleDuplicate}
        onAnalytics={handleAnalytics}
        onWizardEdit={handleWizardEdit}
        onVersionComparison={handleVersionComparison}
      />

      <CaseSmartDuplicateModal
        open={duplicateModalOpen}
        onClose={closeDuplicateModal}
        caseId={selectedCaseId}
        onCreated={handleCaseCreated}
      />

      {/* Modais - Phase 2 */}
      <CaseAdvancedAnalyticsModal
        open={analyticsModalOpen}
        onClose={closeAnalyticsModal}
        caseId={selectedCaseId}
      />

      <CaseEditWizardModal
        open={wizardModalOpen}
        onClose={closeWizardModal}
        caseId={selectedCaseId}
        onSaved={handleCaseSaved}
      />

      <CaseVersionComparisonModal
        open={versionModalOpen}
        onClose={closeVersionModal}
        caseId={selectedCaseId}
        onRestore={(versionData) => {
          // Implementar lógica de restauração
          console.log("Restaurar versão:", versionData);
          closeVersionModal();
        }}
      />
    </div>
  );
}
