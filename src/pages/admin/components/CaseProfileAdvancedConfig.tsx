import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const AI_TUTOR_LEVELS = [
  { value: "desligado", label: "Desligado" },
  { value: "basico", label: "Básico" },
  { value: "detalhado", label: "Detalhado" }
];

type Props = {
  form: any;
  handleFormChange: any;
  handleSuggestHint: any;
};

export function CaseProfileAdvancedConfig({ form, handleFormChange, handleSuggestHint }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50 mt-3 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-semibold">Permitir pular questão?</label>
          <input
            type="checkbox"
            name="can_skip"
            checked={form.can_skip}
            onChange={handleFormChange}
            className="ml-2 accent-cyan-600"
          />
        </div>
        <div>
          <label className="font-semibold">Máx. alternativas para eliminar</label>
          <Input
            name="max_elimination"
            type="number"
            min={0}
            max={form.answer_options?.length - 2 || 2}
            value={form.max_elimination}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <label className="font-semibold">AI Tutor Nível</label>
          <select
            name="ai_tutor_level"
            value={form.ai_tutor_level}
            onChange={handleFormChange}
            className="w-full border rounded px-2 py-2 bg-white"
          >
            {AI_TUTOR_LEVELS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Penalidade ao pular (pontos)</label>
          <Input
            name="skip_penalty_points"
            type="number"
            min={0}
            value={form.skip_penalty_points}
            onChange={handleFormChange}
          />
        </div>
        <div>
          <label className="font-semibold">Penalidade eliminar alternativas (pontos)</label>
          <Input
            name="elimination_penalty_points"
            type="number"
            min={0}
            value={form.elimination_penalty_points}
            onChange={handleFormChange}
          />
        </div>
      </div>
      <div>
        <label className="font-semibold">Ativar Dica de IA?</label>
        <input
          type="checkbox"
          name="ai_hint_enabled"
          checked={form.ai_hint_enabled}
          onChange={handleFormChange}
          className="ml-2 accent-cyan-600"
        />
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="font-semibold">Dica personalizada para o usuário</label>
          <Textarea
            name="manual_hint"
            value={form.manual_hint}
            onChange={handleFormChange}
            placeholder="Dica personalizada a ser exibida ao usuário (opcional)"
            className="text-xs"
            rows={2}
          />
        </div>
        <Button type="button" onClick={handleSuggestHint} variant="secondary" className="mb-1 mt-2">
          Gerar Dica Automaticamente
        </Button>
      </div>
    </div>
  );
}
