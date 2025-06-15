
import React from "react";

/**
 * Mock de preview dos primeiros casos selecionados com base nos filtros (exemplo, pode ser customizado),
 * Em produção, poderia buscar do banco de dados.
 */
export function CaseFiltersPreviewCases({ filters }: { filters: any }) {
  // Apenas demonstração: Não busca do banco para não impactar performance real.
  // Em uso real: buscar do Supabase pelos filtros, limitar a 3-5 casos, mostrar alguma info do caso.
  if (!filters || Object.keys(filters).length === 0) return null;
  return (
    <div className="bg-indigo-50 p-3 rounded shadow mb-2 text-xs text-indigo-800 animate-fade-in">
      <div className="font-semibold mb-1">Preview dos primeiros casos (mock):</div>
      <ul className="ml-4 list-disc">
        <li>Caso RX Tórax - Dificuldade: Fácil</li>
        <li>Caso TC Abdome - Dificuldade: Moderada</li>
        <li>Caso RM Crânio - Dificuldade: Difícil</li>
      </ul>
      <div className="text-indigo-400 mt-1">* Preview real será mostrado na versão final.</div>
    </div>
  );
}
