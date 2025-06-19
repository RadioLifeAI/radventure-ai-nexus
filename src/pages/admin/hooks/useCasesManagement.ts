
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type FilterState = {
  searchTerm: string;
  specialties: string[];
  modalities: string[];
  difficulties: string[];
  pointsRange: [number, number];
  dateRange: { from?: Date; to?: Date };
  status: string[];
  source: string[];
};

type SortField = "title" | "created_at" | "specialty" | "difficulty_level" | "points";
type SortDirection = "asc" | "desc";
type ViewMode = "cards" | "grid" | "table";

export function useCasesManagement() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  
  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    specialties: [],
    modalities: [],
    difficulties: [],
    pointsRange: [0, 100],
    dateRange: {},
    status: [],
    source: []
  });

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [gridDensity, setGridDensity] = useState(3);

  // Saved filters
  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: FilterState }>>([]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("medical_cases")
        .select(`
          *,
          medical_specialties (
            id,
            name
          )
        `)
        .order(sortField, { ascending: sortDirection === "asc" });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar casos:", error);
      toast({
        title: "Erro ao carregar casos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted cases
  const filteredCases = useMemo(() => {
    let filtered = [...cases];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(case_ => 
        case_.title?.toLowerCase().includes(searchLower) ||
        case_.description?.toLowerCase().includes(searchLower) ||
        case_.findings?.toLowerCase().includes(searchLower) ||
        case_.specialty?.toLowerCase().includes(searchLower)
      );
    }

    // Specialties filter
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(case_ => 
        filters.specialties.includes(case_.specialty)
      );
    }

    // Modalities filter
    if (filters.modalities.length > 0) {
      filtered = filtered.filter(case_ => 
        filters.modalities.includes(case_.modality)
      );
    }

    // Difficulties filter
    if (filters.difficulties.length > 0) {
      filtered = filtered.filter(case_ => 
        filters.difficulties.includes(String(case_.difficulty_level))
      );
    }

    // Points range filter
    filtered = filtered.filter(case_ => 
      case_.points >= filters.pointsRange[0] && case_.points <= filters.pointsRange[1]
    );

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(case_ => {
        const caseDate = new Date(case_.created_at);
        if (filters.dateRange.from && caseDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && caseDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Source filter
    if (filters.source.length > 0) {
      filtered = filtered.filter(case_ => {
        if (filters.source.includes("radiopaedia") && case_.is_radiopaedia_case) return true;
        if (filters.source.includes("own") && !case_.is_radiopaedia_case) return true;
        return false;
      });
    }

    return filtered;
  }, [cases, filters]);

  const handleSort = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleCaseSelect = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCases.length === filteredCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredCases.map(case_ => case_.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCases.length === 0) return;

    try {
      switch (action) {
        case "delete":
          await supabase
            .from("medical_cases")
            .delete()
            .in("id", selectedCases);
          
          setCases(prev => prev.filter(case_ => !selectedCases.includes(case_.id)));
          setSelectedCases([]);
          
          toast({
            title: `${selectedCases.length} casos excluídos com sucesso!`,
          });
          break;

        case "export":
          // Implementar exportação
          toast({
            title: "Exportação iniciada",
            description: `${selectedCases.length} casos serão exportados`,
          });
          break;

        default:
          toast({
            title: "Ação em desenvolvimento",
            description: `A ação "${action}" será implementada em breve`,
          });
      }
    } catch (error: any) {
      toast({
        title: "Erro na operação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveFilter = (name: string, filterState: FilterState) => {
    setSavedFilters(prev => [...prev, { name, filters: filterState }]);
    toast({
      title: "Filtro salvo",
      description: `O filtro "${name}" foi salvo com sucesso`,
    });
  };

  const handleLoadFilter = (filterState: FilterState) => {
    setFilters(filterState);
  };

  const handleExport = () => {
    const dataToExport = selectedCases.length > 0 
      ? filteredCases.filter(case_ => selectedCases.includes(case_.id))
      : filteredCases;

    // Implementar exportação real
    toast({
      title: "Exportação iniciada",
      description: `${dataToExport.length} casos serão exportados`,
    });
  };

  const deleteCase = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medical_cases")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCases(cases => cases.filter(c => c.id !== id));
      toast({
        title: "Caso deletado com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao deletar caso:", error);
      toast({
        title: "Erro ao deletar caso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const refetch = () => {
    fetchCases();
  };

  useEffect(() => {
    fetchCases();
  }, [sortField, sortDirection]);

  return {
    // Data
    cases: filteredCases,
    totalCases: cases.length,
    loading,
    selectedCases,
    
    // Filters
    filters,
    setFilters,
    savedFilters,
    handleSaveFilter,
    handleLoadFilter,
    
    // View
    viewMode,
    setViewMode,
    sortField,
    sortDirection,
    handleSort,
    gridDensity,
    setGridDensity,
    
    // Actions
    handleCaseSelect,
    handleSelectAll,
    handleBulkAction,
    handleExport,
    deleteCase,
    refetch
  };
}
