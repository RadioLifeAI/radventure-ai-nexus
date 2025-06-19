
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, 
  Edit, 
  Brain,
  Target,
  Calendar,
  BarChart,
  Wand2,
  GitCompare,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  cases: any[];
  selectedCases: string[];
  onCaseSelect: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onView: (caseId: string) => void;
  onAnalytics?: (caseId: string) => void;
  onWizardEdit?: (caseId: string) => void;
  onVersionComparison?: (caseId: string) => void;
  density: number;
}

export function CasesGridView({ 
  cases, 
  selectedCases, 
  onCaseSelect, 
  onEdit, 
  onView,
  onAnalytics,
  onWizardEdit,
  onVersionComparison,
  density 
}: Props) {
  const getDifficultyColor = (level: number) => {
    const colors = {
      1: "bg-green-100 text-green-700",
      2: "bg-yellow-100 text-yellow-700",
      3: "bg-orange-100 text-orange-700",
      4: "bg-red-100 text-red-700",
      5: "bg-purple-100 text-purple-700"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getDifficultyLabel = (level: number) => {
    const labels = {
      1: "Muito Fácil",
      2: "Fácil", 
      3: "Moderado",
      4: "Difícil",
      5: "Muito Difícil"
    };
    return labels[level as keyof typeof labels] || "Indefinido";
  };

  const getDensityClasses = () => {
    switch (density) {
      case 1: return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
      case 2: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      case 3: return "grid-cols-1 md:grid-cols-2 gap-8";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  };

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">Nenhum caso encontrado</div>
        <div className="text-gray-500 text-sm">Ajuste os filtros ou crie um novo caso</div>
      </div>
    );
  }

  return (
    <div className={`grid ${getDensityClasses()}`}>
      {cases.map((case_) => (
        <Card key={case_.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedCases.includes(case_.id)}
                  onCheckedChange={() => onCaseSelect(case_.id)}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-2">{case_.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {case_.specialty} • {case_.modality}
                  </p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(case_.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(case_.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  {onWizardEdit && (
                    <DropdownMenuItem onClick={() => onWizardEdit(case_.id)}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Editor Wizard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onAnalytics && (
                    <DropdownMenuItem onClick={() => onAnalytics(case_.id)}>
                      <BarChart className="h-4 w-4 mr-2" />
                      Analytics
                    </DropdownMenuItem>
                  )}
                  {onVersionComparison && (
                    <DropdownMenuItem onClick={() => onVersionComparison(case_.id)}>
                      <GitCompare className="h-4 w-4 mr-2" />
                      Versões
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={getDifficultyColor(case_.difficulty_level)}>
                <Brain className="h-3 w-3 mr-1" />
                {getDifficultyLabel(case_.difficulty_level)}
              </Badge>
              <Badge variant="secondary">
                <Target className="h-3 w-3 mr-1" />
                {case_.points} pts
              </Badge>
            </div>

            {case_.findings && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {case_.findings}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(case_.created_at).toLocaleDateString('pt-BR')}
              </div>
              {case_.is_radiopaedia_case && (
                <Badge variant="outline" className="text-xs">
                  Radiopaedia
                </Badge>
              )}
            </div>

            <div className="flex gap-1 pt-2">
              <Button size="sm" variant="outline" onClick={() => onView(case_.id)} className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(case_.id)} className="flex-1">
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
