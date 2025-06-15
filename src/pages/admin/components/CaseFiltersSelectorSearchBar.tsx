
import React from "react";

// Componente de busca interna para opções filtradas (categorias ou modalidades)
export function CaseFiltersSelectorSearchBar({ placeholder, onChange }: { placeholder: string, onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      className="input border rounded px-2 py-1 w-full mb-2 text-sm"
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      autoFocus={false}
    />
  );
}
