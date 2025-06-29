
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, Brain, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CaseCardProps {
  case: {
    id: string;
    title: string;
    specialty: string;
    modality: string;
    difficulty_level: number;
    points: number;
    image_url: any;
    created_at: string;
  };
}

export function CaseCard({ case: caseData }: CaseCardProps) {
  const navigate = useNavigate();

  const handleResolveCase = () => {
    navigate(`/app/caso/${caseData.id}`);
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-100 text-green-800 border-green-200";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 3: return "bg-orange-100 text-orange-800 border-orange-200";
      case 4: return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 4 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < level ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white/90 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
            {caseData.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {getDifficultyStars(caseData.difficulty_level)}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {caseData.specialty}
          </Badge>
          {caseData.modality && (
            <Badge variant="outline" className="text-xs">
              {caseData.modality}
            </Badge>
          )}
          <Badge 
            className={`text-xs border ${getDifficultyColor(caseData.difficulty_level)}`}
          >
            Nível {caseData.difficulty_level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{caseData.points} pts</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>~5 min</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleResolveCase}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Play className="h-4 w-4 mr-2" />
          Resolver Caso
        </Button>
      </CardContent>
    </Card>
  );
}
