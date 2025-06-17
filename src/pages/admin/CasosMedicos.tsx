
import React, { useEffect, useState } from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { MedicalCasesTable } from "./components/MedicalCasesTable";
import { useMedicalCases } from "./hooks/useMedicalCases";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Filter, RefreshCcw } from "lucide-react";

export default function CasosMedicos() {
  // Estados dos filtros
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [specialties, setSpecialties] = useState<{id: number, name: string}[]>([]);
  const [modalities, setModalities] = useState<{name: string}[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Buscar opções de filtro e estatísticas
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Especialidades
      const { data: specialtiesData } = await supabase
        .from("medical_specialties")
        .select("id, name")
        .order("name");
      setSpecialties(specialtiesData || []);

      // Modalidades (agora do banco)
      const { data: modalitiesData } = await supabase
        .from("imaging_modalities")
        .select("name")
        .order("name");
      setModalities(modalitiesData || []);

      // Estatísticas gerais
      const { data: casesData } = await supabase
        .from("medical_cases")
        .select("specialty, modality, difficulty_level, created_at");
      
      if (casesData) {
        const totalCases = casesData.length;
        const bySpecialty = casesData.reduce((acc: any, case_: any) => {
          acc[case_.specialty] = (acc[case_.specialty] || 0) + 1;
          return acc;
        }, {});
        const byModality = casesData.reduce((acc: any, case_: any) => {
          acc[case_.modality] = (acc[case_.modality] || 0) + 1;
          return acc;
        }, {});
        const byDifficulty = casesData.reduce((acc: any, case_: any) => {
          acc[case_.difficulty_level] = (acc[case_.difficulty_level] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: totalCases,
          bySpecialty,
          byModality,
          byDifficulty
        });
      }
    };

    fetchFilterOptions();
  }, []);

  // Traduzir filtros para o hook
  const filterCategory = categoryFilter === "all" ? "" : categoryFilter;
  const filterModality = modalityFilter === "all" ? "" : modalityFilter;

  // Hook de casos com filtros
  const { cases, loading, refreshCases, deleteCase, editCase } = useMedicalCases({ 
    categoryFilter: filterCategory, 
    modalityFilter: filterModality 
  });

  return (
    <div className="space-y-6">
      {/* Formulário de cadastro de novos casos */}
      <CaseProfileForm onCreated={refreshCases} />

      {/* Analytics e Estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics de Casos Médicos
              </CardTitle>
              <CardDescription>
                Visão geral dos casos cadastrados no sistema
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshCases}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="space-y-4">
              {/* Estatísticas gerais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-800">Total de Casos</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(stats.bySpecialty).length}
                  </div>
                  <div className="text-sm text-green-800">Especialidades</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(stats.byModality).length}
                  </div>
                  <div className="text-sm text-purple-800">Modalidades</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.keys(stats.byDifficulty).length}
                  </div>
                  <div className="text-sm text-orange-800">Níveis Dificuldade</div>
                </div>
              </div>

              {/* Top especialidades */}
              <div>
                <h4 className="font-semibold mb-2">Casos por Especialidade:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.bySpecialty)
                    .sort(([,a]: any, [,b]: any) => b - a)
                    .slice(0, 8)
                    .map(([specialty, count]: any) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}: {count}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Top modalidades */}
              <div>
                <h4 className="font-semibold mb-2">Casos por Modalidade:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.byModality)
                    .sort(([,a]: any, [,b]: any) => b - a)
                    .slice(0, 6)
                    .map(([modality, count]: any) => (
                      <Badge key={modality} variant="outline">
                        {modality}: {count}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros e tabela de casos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Casos Cadastrados ({cases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Especialidade:</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as especialidades</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.name}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Modalidade:</label>
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as modalidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  {modalities.map((modality) => (
                    <SelectItem key={modality.name} value={modality.name}>
                      {modality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de casos */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <MedicalCasesTable cases={cases} onDelete={deleteCase} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
