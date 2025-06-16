
import React from "react";
import { CaseCard } from "./CaseCard";

interface Case {
  id: string;
  title: string;
  specialty?: string;
  modality?: string;
  difficulty_level?: number;
  difficulty_description?: string;
  image_url?: any;
  points?: number;
  created_at: string;
  category?: { name: string };
  difficulty?: { level: number; description: string };
}

interface CasesGridProps {
  cases: Case[];
}

export function CasesGrid({ cases }: CasesGridProps) {
  if (!cases || cases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Nenhum caso disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cases.map((caseItem) => (
        <CaseCard 
          key={caseItem.id} 
          case={{
            id: caseItem.id,
            title: caseItem.title,
            specialty: caseItem.specialty || caseItem.category?.name || 'Não especificado',
            modality: caseItem.modality || 'Não especificado',
            difficulty: caseItem.difficulty_level || caseItem.difficulty?.level || 1,
            difficultyDescription: caseItem.difficulty_description || caseItem.difficulty?.description || 'Iniciante',
            imageUrl: Array.isArray(caseItem.image_url) && caseItem.image_url.length > 0 
              ? caseItem.image_url[0] 
              : null,
            points: caseItem.points || 10,
            createdAt: caseItem.created_at
          }}
        />
      ))}
    </div>
  );
}
