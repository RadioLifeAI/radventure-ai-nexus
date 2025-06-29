
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Stethoscope, 
  Brain, 
  Wand2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface Props {
  form: any;
  setForm: (form: any) => void;
  categories: any[];
  difficulties: any[];
  highlightedFields: string[];
  handlers: any;
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
}

export function CaseProfileBasicSectionWizardEnhanced({
  form,
  setForm,
  categories,
  difficulties,
  highlightedFields,
  handlers,
  renderTooltipTip
}: Props) {
  const { handleFormChange, handleSuggestFindings, handleSuggestMainQuestion } = handlers;

  const isIntegrated = !!(form.category_id && form.modality);

  return (
    <div className="space-y-6">
      {/* Status de Integração */}
      <Card className={`border-2 ${isIntegrated 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Informações Básicas do Caso
            <Badge variant="secondary" className={isIntegrated 
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
            }>
              {isIntegrated ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {isIntegrated ? 'INTEGRADO' : 'CONFIGURE'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isIntegrated 
              ? `Sistema ativo: Organização automática por Cat#${form.category_id} → ${form.modality}`
              : 'Selecione categoria e modalidade para ativar o sistema integrado de imagens'
            }
          </p>
        </CardHeader>
      </Card>

      {/* Formulário Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-semibold block">
                  Título do Caso *
                  {renderTooltipTip("tip-title", "Título descritivo do caso clínico")}
                </label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Ex: Pneumonia em paciente jovem"
                  required
                  className={highlightedFields.includes("title") ? "ring-2 ring-cyan-400" : ""}
                />
              </div>

              <div>
                <label className="font-semibold block">
                  Especialidade Médica *
                  {renderTooltipTip("tip-category", "Categoria médica do caso")}
                </label>
                <Select name="category_id" value={form.category_id?.toString()} onValueChange={(value) => handleFormChange({ target: { name: 'category_id', value } })}>
                  <SelectTrigger className={highlightedFields.includes("category_id") ? "ring-2 ring-cyan-400" : ""}>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-semibold block">
                  Modalidade de Imagem *
                  {renderTooltipTip("tip-modality", "Tipo de exame de imagem")}
                </label>
                <Select name="modality" value={form.modality} onValueChange={(value) => handleFormChange({ target: { name: 'modality', value } })}>
                  <SelectTrigger className={highlightedFields.includes("modality") ? "ring-2 ring-cyan-400" : ""}>
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Radiografia (RX)">Radiografia (RX)</SelectItem>
                    <SelectItem value="Tomografia Computadorizada (TC)">Tomografia Computadorizada (TC)</SelectItem>
                    <SelectItem value="Ressonância Magnética (RM)">Ressonância Magnética (RM)</SelectItem>
                    <SelectItem value="Ultrassonografia (US)">Ultrassonografia (US)</SelectItem>
                    <SelectItem value="Mamografia">Mamografia</SelectItem>
                    <SelectItem value="Medicina Nuclear">Medicina Nuclear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-semibold block">
                  Nível de Dificuldade *
                  {renderTooltipTip("tip-difficulty", "Complexidade do caso")}
                </label>
                <Select name="difficulty_level" value={form.difficulty_level?.toString()} onValueChange={(value) => handleFormChange({ target: { name: 'difficulty_level', value } })}>
                  <SelectTrigger className={highlightedFields.includes("difficulty_level") ? "ring-2 ring-cyan-400" : ""}>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.id} value={diff.level.toString()}>
                        Nível {diff.level} {diff.description && `- ${diff.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block">Idade</label>
                  <Input
                    name="patient_age"
                    value={form.patient_age}
                    onChange={handleFormChange}
                    placeholder="Ex: 45 anos"
                  />
                </div>
                <div>
                  <label className="font-semibold block">Gênero</label>
                  <Select name="patient_gender" value={form.patient_gender} onValueChange={(value) => handleFormChange({ target: { name: 'patient_gender', value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="font-semibold block">Duração dos Sintomas</label>
                <Input
                  name="symptoms_duration"
                  value={form.symptoms_duration}
                  onChange={handleFormChange}
                  placeholder="Ex: 3 dias, 2 semanas"
                />
              </div>

              <div>
                <label className="font-semibold block">Informações Clínicas</label>
                <Textarea
                  name="patient_clinical_info"
                  value={form.patient_clinical_info}
                  onChange={handleFormChange}
                  placeholder="Histórico médico, sintomas, exame físico..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Seção de Achados e Pergunta */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Achados e Pergunta Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="font-semibold">
                  Achados Radiológicos *
                  {renderTooltipTip("tip-findings", "Descreva os achados visíveis nas imagens")}
                </label>
                <Button
                  type="button"
                  onClick={handleSuggestFindings}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Sugerir IA
                </Button>
              </div>
              <Textarea
                name="findings"
                value={form.findings}
                onChange={handleFormChange}
                placeholder="Descreva os achados radiológicos observados..."
                required
                rows={4}
                className={highlightedFields.includes("findings") ? "ring-2 ring-cyan-400" : ""}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="font-semibold">
                  Pergunta Principal *
                  {renderTooltipTip("tip-main-question", "Pergunta que será feita ao estudante")}
                </label>
                <Button
                  type="button"
                  onClick={handleSuggestMainQuestion}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Sugerir IA
                </Button>
              </div>
              <Textarea
                name="main_question"
                value={form.main_question}
                onChange={handleFormChange}
                placeholder="Qual é o diagnóstico mais provável?"
                required
                rows={2}
                className={highlightedFields.includes("main_question") ? "ring-2 ring-cyan-400" : ""}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
