
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Archive, 
  Trash2, 
  Eye,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Case = {
  id: string;
  title: string;
  specialty: string;
  modality: string;
  difficulty_level: number;
  points: number;
  created_at: string;
  is_radiopaedia_case: boolean;
  image_url?: any;
  // Métricas simuladas
  views?: number;
  accuracy?: number;
  avg_time?: number;
};

type Props = {
  cases: Case[];
  selectedCases: string[];
  onCaseSelect: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onDelete: (caseId: string) => void;
  onDuplicate: (caseId: string) => void;
  onView: (caseId: string) => void;
};

export function CasesCardsView({
  cases,
  selectedCases,
  onCaseSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onView
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cases.map((case_) => (
        <Card key={case_.id} className="group hover:shadow-lg transition-all duration-200 relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCases.includes(case_.id)}
                  onCheckedChange={() => onCaseSelect(case_.id)}
                  className="data-[state=checked]:bg-blue-600"
                />
                {case_.is_radiopaedia_case && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                    Radiopaedia
                  </Badge>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
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
                  <DropdownMenuItem onClick={() => onDuplicate(case_.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(case_.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Imagem do caso */}
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
              {case_.image_url && Array.isArray(case_.image_url) && case_.image_url.length > 0 ? (
                <img 
                  src={case_.image_url[0]} 
                  alt={case_.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">
                {case_.title}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                {format(new Date(case_.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            {/* Badges de categoria */}
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {case_.specialty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {case_.modality}
              </Badge>
            </div>

            {/* Dificuldade e pontos */}
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${getDifficultyColor(case_.difficulty_level)}`}>
                {getDifficultyLabel(case_.difficulty_level)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Target className="h-3 w-3" />
                {case_.points} pts
              </div>
            </div>

            {/* Métricas (simuladas) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="text-center">
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" />
                </div>
                <div className="text-sm font-medium">{case_.views || Math.floor(Math.random() * 100)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                </div>
                <div className="text-sm font-medium">{case_.accuracy || Math.floor(Math.random() * 100)}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3" />
                </div>
                <div className="text-sm font-medium">{case_.avg_time || Math.floor(Math.random() * 5) + 2}min</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
