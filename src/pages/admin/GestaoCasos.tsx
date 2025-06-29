
import React, { useState } from "react";
import { BackToDashboard } from "@/components/navigation/BackToDashboard";
import { CasesManagementHeader } from "@/components/admin/cases/CasesManagementHeader";
import { CasesAdvancedFilters } from "./components/CasesAdvancedFilters";
import { CasesViewSelector, ViewMode } from "./components/CasesViewSelector";
import { CasesCardsView } from "./components/CasesCardsView";
import { CasesGridView } from "./components/CasesGridView";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { CaseRichViewModal } from "./components/CaseRichViewModal";
import { CaseSmartDuplicateModal } from "./components/CaseSmartDuplicateModal";
import { CaseAdvancedAnalyticsModal } from "./components/CaseAdvancedAnalyticsModal";
import { CaseEditWizardModal } from "./components/CaseEditWizardModal";
import { CaseVersionComparisonModal } from "./components/CaseVersionComparisonModal";
import { NotificationProvider, NotificationContainer } from "./components/CaseNotificationSystem";
import { CaseShortcutsManager, useCaseShortcuts } from "./components/CaseShortcutsManager";
import { useCasesManagement } from "./hooks/useCasesManagement";
import { useDisclosure } from "@mantine/hooks";
import { Loader } from "@/components/Loader";

export default function GestaoCasos() {
  console.log('🏥 GestaoCasos: Componente iniciando renderização');

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

  console.log('📊 GestaoCasos: Dados carregados', { 
    totalCases, 
    casesCount: cases?.length, 
    loading,
    viewMode 
  });

  // Modal states - Unificados usando apenas wizard avançado
  const [richViewModalOpen, { open: openRichViewModal, close: closeRichViewModal }] = useDisclosure(false);
  const [duplicateModalOpen, { open: openDuplicateModal, close: closeDuplicateModal }] = useDisclosure(false);
  const [analyticsModalOpen, { open: openAnalyticsModal, close: closeAnalyticsModal }] = useDisclosure(false);
  const [wizardModalOpen, { open: openWizardModal, close: closeWizardModal }] = useDisclosure(false);
  const [versionModalOpen, { open: openVersionModal, close: closeVersionModal }] = useDisclosure(false);
  
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Handlers unificados - todos usam o wizard avançado
  const handleEdit = (caseId: string) => {
    console.log('✏️ GestaoCasos: Abrindo wizard avançado para caso:', caseId);
    setSelectedCaseId(caseId);
    openWizardModal();
  };

  const handleQuickEdit = (caseId: string) => {
    console.log('⚡ GestaoCasos: Abrindo wizard avançado (modo rápido) para caso:', caseId);
    setSelectedCaseId(caseId);
    openWizardModal();
  };

  const handleView = (caseId: string) => {
    console.log('👁️ GestaoCasos: Abrindo visualização para caso:', caseId);
    setSelectedCaseId(caseId);
    openRichViewModal();
  };

  const handleDuplicate = (caseId: string) => {
    console.log('📋 GestaoCasos: Abrindo duplicação para caso:', caseId);
    setSelectedCaseId(caseId);
    openDuplicateModal();
  };

  const handleAnalytics = (caseId: string) => {
    console.log('📈 GestaoCasos: Abrindo analytics para caso:', caseId);
    setSelectedCaseId(caseId);
    openAnalyticsModal();
  };

  const handleWizardEdit = (caseId: string) => {
    console.log('🧙 GestaoCasos: Abrindo wizard para caso:', caseId);
    setSelectedCaseId(caseId);
    openWizardModal();
  };

  const handleVersionComparison = (caseId: string) => {
    console.log('🔄 GestaoCasos: Abrindo comparação de versões para caso:', caseId);
    setSelectedCaseId(caseId);
    openVersionModal();
  };

  const handleCaseSaved = () => {
    console.log('💾 GestaoCasos: Caso salvo, refazendo consulta...');
    refetch();
    closeWizardModal();
  };

  const handleCaseCreated = () => {
    console.log('✨ GestaoCasos: Novo caso criado, refazendo consulta...');
    refetch();
    closeDuplicateModal();
  };

  const shortcuts = useCaseShortcuts({
    onQuickEdit: selectedCaseId ? () => handleQuickEdit(selectedCaseId) : undefined,
    onView: selectedCaseId ? () => handleView(selectedCaseId) : undefined,
    onDuplicate: selectedCaseId ? () => handleDuplicate(selectedCaseId) : undefined,
    onAnalytics: selectedCaseId ? () => handleAnalytics(selectedCaseId) : undefined,
    onWizardEdit: selectedCaseId ? () => handleWizardEdit(selectedCaseId) : undefined,
    onVersionComparison: selectedCaseId ? () => handleVersionComparison(selectedCaseId) : undefined,
  });

  const renderCasesView = () => {
    if (loading) {
      console.log('⏳ GestaoCasos: Exibindo loader...');
      return <Loader />;
    }

    console.log('🎯 GestaoCasos: Renderizando visualização:', viewMode);

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

  console.log('🎨 GestaoCasos: Renderizando interface principal');

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <BackToDashboard variant="back" />
            <div className="text-sm text-gray-600 font-medium">
              {cases.length} de {totalCases} casos exibidos
            </div>
          </div>

          <CasesManagementHeader />

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <CasesAdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSaveFilter={handleSaveFilter}
              savedFilters={savedFilters}
              onLoadFilter={handleLoadFilter}
              totalCases={totalCases}
              filteredCases={cases.length}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-white">
              {renderCasesView()}
            </div>
          </div>

          {/* Modais Unificados - Apenas os essenciais */}
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

          <CaseAdvancedAnalyticsModal
            open={analyticsModalOpen}
            onClose={closeAnalyticsModal}
            caseId={selectedCaseId}
          />

          {/* Modal Unificado - Apenas o Wizard Avançado */}
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
              console.log("🔄 GestaoCasos: Restaurar versão:", versionData);
              closeVersionModal();
            }}
          />

          <NotificationContainer />
          <CaseShortcutsManager shortcuts={shortcuts} />
        </div>
      </div>
    </NotificationProvider>
  );
}
