
import React from "react";
import { CaseCard } from "./CaseCard";

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
  cases: Case[];
};

export function CasesGrid({ cases }: Props) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum caso encontrado</h3>
        <p className="text-cyan-100">Tente ajustar os filtros ou explore outras especialidades</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {cases.map((case_) => (
        <CaseCard key={case_.id} case={case_} />
      ))}
    </div>
  );
}
