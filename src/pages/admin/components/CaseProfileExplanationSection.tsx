
import React from "react";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  form: any;
  highlightedFields: string[];
  handleFormChange: any;
  handleSuggestExplanation: any;
  renderTooltipTip: any;
  handleSuggestHint: any; // <-- Added this prop
};

export function CaseProfileExplanationSection({
  form,
  highlightedFields,
  handleFormChange,
  handleSuggestExplanation,
  renderTooltipTip,
  handleSuggestHint
}: Props) {
  return (
    <div className="mt-4">
      <label className="font-semibold block">
        Explicação e Feedback *
        {renderTooltipTip("tip-explanation", "Texto exibido após responder. Dê feedback e raciocínio clínico!")}
      </label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={handleSuggestExplanation}
          className="text-xs px-2 py-1 border bg-cyan-50 rounded hover:bg-cyan-100 font-semibold"
        >
          Sugerir Explicação (IA)
        </button>
        <button
          type="button"
          onClick={handleSuggestHint}
          className="text-xs px-2 py-1 border bg-cyan-50 rounded hover:bg-cyan-100 font-semibold"
        >
          Sugerir Dica (IA)
        </button>
      </div>
      <Textarea
        name="explanation"
        value={form.explanation}
        onChange={handleFormChange}
        placeholder="Escreva aqui explicações, feedbacks, orientações ao estudante..."
        required
        className={highlightedFields.includes("explanation") ? "ring-2 ring-cyan-400" : ""}
      />
    </div>
  );
}
