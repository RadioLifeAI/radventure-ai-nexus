
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

import { useRealMedicalCases } from "@/hooks/useRealMedicalCases";
import { useDisclosure } from "@mantine/hooks";
import { Loader } from "@/components/Loader";

export default function GestaoCasos() {
  const { cases, isLoading, deleteCase, refetch } = useRealMedicalCases();
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    searchTerm: "",
    specialties: [],
    modalities: [],
    difficulties: [],
    pointsRange: [0, 100] as [number, number],
    dateRange: {},
    status: [],
    source: []
  });
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [gridDensity, setGridDensity] = useState(3);

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

  // Filter cases
  const filteredCases = cases.filter(case_ => {
    const matchesSearch = !filters.searchTerm || 
      case_.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      case_.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    return matchesSearch;
  });

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

  const handleCaseSelect = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCases(prev => 
      prev.length === filteredCases.length ? [] : filteredCases.map(case_ => case_.id)
    );
  };

  const handleBulkAction = async (action: string) => {
    console.log("Ação em lote:", action, selectedCases);
  };

  const handleExport = () => {
    console.log("Exportar casos:", selectedCases);
  };

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleSaveFilter = (name: string, filterState: any) => {
    console.log("Salvar filtro:", name, filterState);
  };

  const handleLoadFilter = (filterState: any) => {
    setFilters(filterState);
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

  const shortcuts = useCaseShortcuts({
    onQuickEdit: selectedCaseId ? () => handleQuickEdit(selectedCaseId) : undefined,
    onView: selectedCaseId ? () => handleView(selectedCaseId) : undefined,
    onDuplicate: selectedCaseId ? () => handleDuplicate(selectedCaseId) : undefined,
    onAnalytics: selectedCaseId ? () => handleAnalytics(selectedCaseId) : undefined,
    onWizardEdit: selectedCaseId ? () => handleWizardEdit(selectedCaseId) : undefined,
    onVersionComparison: selectedCaseId ? () => handleVersionComparison(selectedCaseId) : undefined,
  });

  const renderCasesView = () => {
    if (isLoading) {
      return <Loader />;
    }

    switch (viewMode) {
      case "cards":
        return (
          <CasesCardsView
            cases={filteredCases}
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
            cases={filteredCases}
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
            cases={filteredCases}
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
    <NotificationProvider>
      <div className="space-y-6">
        {/* Navegação */}
        <div className="flex items-center justify-between">
          <BackToDashboard variant="back" />
          <div className="text-sm text-gray-500">
            {filteredCases.length} de {cases.length} casos exibidos
          </div>
        </div>

        <CasesManagementHeader />

        {/* Filtros Básicos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <input
            type="text"
            placeholder="Buscar casos..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Seletor de Visualização Simplificado */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded ${viewMode === "cards" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded ${viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Tabela
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {selectedCases.length} selecionados
            </div>
          </div>
        </div>

        {/* Visualização dos Casos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderCasesView()}
        </div>

        {/* Modais básicos para compatibilidade */}
        {editModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Editar Caso</h3>
              <p>Modal de edição em desenvolvimento</p>
              <button 
                onClick={closeEditModal}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <NotificationContainer />
        <CaseShortcutsManager shortcuts={shortcuts} />
      </div>
    </NotificationProvider>
  );
}
