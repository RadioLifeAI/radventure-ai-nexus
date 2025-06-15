
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  form: any;
  highlightedFields: string[];
  handleFormChange: any;
  handleSuggestExplanation: any;
  renderTooltipTip: any;
};

export function CaseProfileExplanationSection({
  form, highlightedFields, handleFormChange, handleSuggestExplanation, renderTooltipTip
}: Props) {
  return (
    <div>
      <label className="font-semibold">
        Explicação e Feedback Geral *
        {renderTooltipTip("tip-explanation", "Forneça uma explicação detalhada para aprendizado do usuário quando ele concluir o caso.")}
      </label>
      <div className="flex gap-2 items-end">
        <Textarea
          name="explanation"
          value={form.explanation}
          onChange={handleFormChange}
          placeholder="Explique o caso e a resposta correta..."
          required
          className={highlightedFields.includes("explanation") ? "ring-2 ring-cyan-400" : ""}
        />
        <Button
          type="button"
          onClick={handleSuggestExplanation}
          variant="secondary"
          className="mb-1 mt-2"
          title="Gerar explicação geral automaticamente via IA"
        >
          Gerar Explicação
        </Button>
      </div>
    </div>
  );
}
