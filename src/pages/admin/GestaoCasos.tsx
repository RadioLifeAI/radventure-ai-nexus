
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

// Phase 3 Components
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
    console.log('✏️ GestaoCasos: Abrindo modal de edição para caso:', caseId);
    setSelectedCaseId(caseId);
    openEditModal();
  };

  const handleQuickEdit = (caseId: string) => {
    console.log('⚡ GestaoCasos: Abrindo edição rápida para caso:', caseId);
    setSelectedCaseId(caseId);
    openQuickEditModal();
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

  // Phase 2 handlers
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
    closeEditModal();
    closeQuickEditModal();
    closeWizardModal();
  };

  const handleCaseCreated = () => {
    console.log('✨ GestaoCasos: Novo caso criado, refazendo consulta...');
    refetch();
    closeDuplicateModal();
  };

  // Phase 3 - Shortcuts configuration
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
          {/* Navegação com fundo garantido */}
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <BackToDashboard variant="back" />
            <div className="text-sm text-gray-600 font-medium">
              {cases.length} de {totalCases} casos exibidos
            </div>
          </div>

          <CasesManagementHeader />

          {/* Filtros Avançados com fundo claro forçado */}
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

          {/* Seletor de Visualização com fundo claro */}
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

          {/* Visualização dos Casos com fundo garantido */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-white">
              {renderCasesView()}
            </div>
          </div>

          {/* Modais - Phase 1 com z-index otimizado */}
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

          {/* Modais - Phase 2 com z-index otimizado */}
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
              console.log("🔄 GestaoCasos: Restaurar versão:", versionData);
              closeVersionModal();
            }}
          />

          {/* Phase 3 Components */}
          <NotificationContainer />
          <CaseShortcutsManager shortcuts={shortcuts} />
        </div>
      </div>
    </NotificationProvider>
  );
}
