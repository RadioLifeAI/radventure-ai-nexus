
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type Props = {
  form: any;
  highlightedFields: string[];
  handleOptionChange: any;
  handleOptionFeedbackChange: any;
  handleShortTipChange: any;
  handleCorrectChange: any;
  handleSuggestAlternatives: any;
  handleRandomizeOptions: any; // NOVO
  renderTooltipTip: any;
};

export function CaseProfileAlternativesSection({
  form, highlightedFields, handleOptionChange, handleOptionFeedbackChange,
  handleShortTipChange, handleCorrectChange, handleSuggestAlternatives, handleRandomizeOptions, renderTooltipTip
}: Props) {
  return (
    <div>
      <div className="flex items-end gap-2 mb-1">
        <label className="font-semibold">
          Alternativas do Quiz *
          {renderTooltipTip("tip-alternatives", "Varie as alternativas para aumentar o nível de desafio! Em breve, será possível embaralhar as opções no modo revisão.")}
        </label>
        <Button type="button" onClick={handleSuggestAlternatives} variant="secondary">
          Gerar Alternativas
        </Button>
        <Button type="button" onClick={handleRandomizeOptions} variant="ghost" title="Embaralhar Alternativas">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 3h5v5m0 0l-8.5 8.5a5 5 0 01-7.07 0v0a5 5 0 010-7.07L16 3zm0 0l5 5" /></svg>
            Embaralhar
          </span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        {["A", "B", "C", "D"].map((letter, idx) => (
          <div key={idx} className={`flex flex-col border rounded-lg px-4 py-2 gap-2 bg-gray-50 ${highlightedFields.includes(`answer_option_${idx}`) ? "ring-2 ring-cyan-400" : ""}`}>
            <div className="flex items-center gap-2">
              <input type="radio" name="correct_option" checked={form.correct_answer_index === idx} onChange={() => handleCorrectChange(idx)}
                className="accent-cyan-600" aria-label={`Selecionar alternativa ${letter} como correta`} />
              <Input
                value={form.answer_options[idx]}
                onChange={e => handleOptionChange(idx, e.target.value)}
                placeholder={`Alternativa ${letter}`}
                className="flex-1"
                required
                maxLength={160}
              />
            </div>
            <Textarea
              value={form.answer_feedbacks[idx]}
              onChange={e => handleOptionFeedbackChange(idx, e.target.value)}
              placeholder="Feedback (opcional para essa alternativa)"
              className="text-xs"
              rows={2}
            />
            <div className="flex items-center">
              <Input
                value={form.answer_short_tips[idx]}
                onChange={e => handleShortTipChange(idx, e.target.value)}
                placeholder={`Meta-dica para alternativa ${letter} (opcional, ex: "Confunde com doença X")`}
                className="text-xs"
                maxLength={80}
              />
              {renderTooltipTip(`tip-short-tip-${idx}`, "Meta-dicas são pistas breves para o usuário refletir, por exemplo: 'Cuidado! Confunde com doença X'.")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

