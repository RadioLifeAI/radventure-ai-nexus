
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Wand2, Shuffle } from "lucide-react";

interface Props {
  form: any;
  setForm: (form: any) => void;
  handlers: any;
  highlightedFields: string[];
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
}

export function CaseProfileAlternativesSection({
  form,
  setForm,
  handlers,
  highlightedFields,
  renderTooltipTip
}: Props) {
  const { 
    handleOptionChange, 
    handleOptionFeedbackChange, 
    handleShortTipChange, 
    handleCorrectChange,
    handleSuggestAlternatives,
    handleRandomizeOptions
  } = handlers;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Alternativas do Quiz
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Sistema Inteligente
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSuggestAlternatives}
              variant="outline"
              size="sm"
              className="bg-cyan-50 hover:bg-cyan-100"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Gerar Alternativas (IA)
            </Button>
            <Button
              type="button"
              onClick={handleRandomizeOptions}
              variant="outline"
              size="sm"
              className="bg-purple-50 hover:bg-purple-100"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Embaralhar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["A", "B", "C", "D"].map((letter, idx) => (
          <Card key={idx} className={`border-2 ${form.correct_answer_index === idx ? 'border-green-400 bg-green-50' : 'border-gray-200'} ${highlightedFields.includes(`answer_option_${idx}`) ? "ring-2 ring-cyan-400" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <input 
                  type="radio" 
                  name="correct_option" 
                  checked={form.correct_answer_index === idx} 
                  onChange={() => handleCorrectChange(idx)}
                  className="accent-green-600" 
                />
                <span className="font-bold">Alternativa {letter}</span>
                {form.correct_answer_index === idx && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Correta
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Input
                  value={form.answer_options[idx] || ''}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  placeholder={`Digite a alternativa ${letter}`}
                  required
                  maxLength={160}
                  className="font-medium"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Feedback (opcional)
                </label>
                <Textarea
                  value={form.answer_feedbacks[idx] || ''}
                  onChange={e => handleOptionFeedbackChange(idx, e.target.value)}
                  placeholder="Explicação sobre esta alternativa..."
                  className="text-sm"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Dica curta (opcional)
                  {renderTooltipTip(`tip-short-tip-${idx}`, "Meta-dicas são pistas breves para o usuário refletir")}
                </label>
                <Input
                  value={form.answer_short_tips[idx] || ''}
                  onChange={e => handleShortTipChange(idx, e.target.value)}
                  placeholder={`Dica para alternativa ${letter}`}
                  className="text-xs"
                  maxLength={80}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
