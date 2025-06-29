
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  BarChart, 
  Image as ImageIcon,
  Calendar,
  User,
  Target,
  Trophy
} from "lucide-react";

interface CasesCardsViewProps {
  cases: any[];
  selectedCases: string[];
  onCaseSelect: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onView: (caseId: string) => void;
  onDuplicate: (caseId: string) => void;
  onDelete: (caseId: string) => void;
  onAnalytics: (caseId: string) => void;
  onWizardEdit: (caseId: string) => void;
  onVersionComparison: (caseId: string) => void;
}

export function CasesCardsView({
  cases,
  selectedCases,
  onCaseSelect,
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  onAnalytics,
  onWizardEdit,
  onVersionComparison
}: CasesCardsViewProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-orange-100 text-orange-800";
      case 4: return "bg-red-100 text-red-800";
      case 5: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cases.map((case_) => {
        const isSelected = selectedCases.includes(case_.id);
        
        return (
          <Card 
            key={case_.id} 
            className={`relative transition-all hover:shadow-lg ${
              isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
          >
            {/* Checkbox de seleção */}
            <div className="absolute top-4 right-4 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onCaseSelect(case_.id)}
              />
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2 pr-8">
                    {case_.title || 'Caso sem título'}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {case_.medical_specialties?.name || case_.specialty || 'Não definida'}
                    </Badge>
                    <Badge 
                      className={`text-xs ${getDifficultyColor(case_.difficulty_level)}`}
                    >
                      Nível {case_.difficulty_level || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* FASE 3: Mostrar imagens usando display_images */}
              {case_.display_images?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {case_.display_images.length} imagem(ns)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {case_.display_images.slice(0, 4).map((imageUrl: string, idx: number) => (
                      <div key={idx} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Imagem ${idx + 1}`}
                          className="w-full h-20 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {idx === 3 && case_.display_images.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              +{case_.display_images.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações do caso */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>{case_.modality || 'Modalidade não definida'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="h-4 w-4" />
                  <span>{case_.points || 0} pontos</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(case_.created_at)}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(case_.id)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(case_.id)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDuplicate(case_.id)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAnalytics(case_.id)}
                  className="flex-1"
                >
                  <BarChart className="h-4 w-4 mr-1" />
                  Analytics
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(case_.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {cases.length === 0 && (
        <div className="col-span-full text-center py-12">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum caso encontrado</h3>
          <p className="text-gray-500">Ajuste os filtros ou crie um novo caso médico.</p>
        </div>
      )}
    </div>
  );
}
