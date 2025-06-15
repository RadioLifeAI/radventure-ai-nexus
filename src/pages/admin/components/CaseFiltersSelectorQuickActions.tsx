
import React from "react";
import { Button } from "@/components/ui/button";

export function CaseFiltersSelectorQuickActions({ onQuickSelect }: { onQuickSelect: (option: string) => void }) {
  return (
    <div className="flex gap-2 mb-2">
      <Button size="sm" variant="secondary" onClick={() => onQuickSelect("all-tc")}>Todas TC</Button>
      <Button size="sm" variant="secondary" onClick={() => onQuickSelect("all-rx")}>Todas RX</Button>
      <Button size="sm" variant="secondary" onClick={() => onQuickSelect("all-rm")}>Todas RM</Button>
      <Button size="sm" variant="outline" onClick={() => onQuickSelect("clear")}>Limpar Modalidades</Button>
    </div>
  );
}
