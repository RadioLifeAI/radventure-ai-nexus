
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Clock, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Case = {
  id: string;
  title: string;
  specialty: string;
  modality: string;
  difficulty_level: number;
  points: number;
  image_url: any;
  created_at: string;
};

type Props = {
  case: Case;
};

export function CaseCard({ case: case_ }: Props) {
  const navigate = useNavigate();
  
  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-orange-500";
      case 4: return "bg-red-500";
      case 5: return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return "Iniciante";
      case 2: return "Fácil";
      case 3: return "Médio";
      case 4: return "Difícil";
      case 5: return "Expert";
      default: return "N/A";
    }
  };

  let imageUrl = "";
  try {
    if (Array.isArray(case_.image_url) && case_.image_url.length > 0) {
      imageUrl = case_.image_url[0]?.url || "";
    } else if (typeof case_.image_url === 'string') {
      imageUrl = case_.image_url;
    }
  } catch {
    imageUrl = "";
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-cyan-200/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group">
      <CardContent className="p-0">
        <div className="aspect-video bg-gray-800 rounded-t-lg overflow-hidden relative">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={case_.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-4xl opacity-50">🧠</div>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={`${getDifficultyColor(case_.difficulty_level)} text-white border-0`}>
              {getDifficultyText(case_.difficulty_level)}
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{case_.title}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              {case_.specialty}
            </Badge>
            {case_.modality && (
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {case_.modality}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Trophy size={16} className="text-yellow-400" />
                <span>{case_.points || 10} pts</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-blue-400" />
                <span>~5 min</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate(`/caso/${case_.id}`)}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
          >
            <Play size={16} className="mr-2" />
            Resolver Caso
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
