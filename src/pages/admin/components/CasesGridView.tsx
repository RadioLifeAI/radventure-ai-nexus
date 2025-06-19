
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  MoreVertical,
  Eye,
  Target,
  Calendar,
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
};

type Props = {
  cases: Case[];
  selectedCases: string[];
  onCaseSelect: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onView: (caseId: string) => void;
  density: number;
};

export function CasesGridView({
  cases,
  selectedCases,
  onCaseSelect,
  onEdit,
  onView,
  density
}: Props) {
  const getDifficultyColor = (level: number) => {
    const colors = {
      1: "bg-green-500",
      2: "bg-yellow-500", 
      3: "bg-orange-500",
      4: "bg-red-500",
      5: "bg-purple-500"
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  const getGridCols = () => {
    const cols = {
      1: "grid-cols-1",
      2: "grid-cols-2", 
      3: "grid-cols-3",
      4: "grid-cols-4"
    };
    return cols[density as keyof typeof cols] || "grid-cols-3";
  };

  return (
    <div className={`grid ${getGridCols()} gap-3`}>
      {cases.map((case_) => (
        <div 
          key={case_.id} 
          className="group relative bg-white rounded-lg border hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          {/* Selection checkbox */}
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={selectedCases.includes(case_.id)}
              onCheckedChange={() => onCaseSelect(case_.id)}
              className="bg-white data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Difficulty indicator */}
          <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getDifficultyColor(case_.difficulty_level)}`} />

          {/* Image */}
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {case_.image_url && Array.isArray(case_.image_url) && case_.image_url.length > 0 ? (
              <img 
                src={case_.image_url[0]} 
                alt={case_.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-gray-400" />
            )}
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <h3 className="font-medium text-sm line-clamp-2 text-gray-900">
              {case_.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <Target className="h-3 w-3" />
                {case_.points}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-3 w-3" />
                {format(new Date(case_.created_at), "dd/MM", { locale: ptBR })}
              </div>
            </div>

            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {case_.specialty.split(" ")[0]}
              </Badge>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {case_.modality.split(" ")[0]}
              </Badge>
            </div>
          </div>

          {/* Hover actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onView(case_.id)}
                className="h-7 px-2 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(case_.id)}
                className="h-7 px-2 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>

          {/* Radiopaedia badge */}
          {case_.is_radiopaedia_case && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                RP
              </Badge>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
