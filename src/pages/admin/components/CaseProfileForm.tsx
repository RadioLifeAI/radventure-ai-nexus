import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadWithZoom } from "./ImageUploadWithZoom";
import { supabase } from "@/integrations/supabase/client";
import { CaseModalityFields } from "./CaseModalityFields";
import { toast } from "@/components/ui/use-toast";

const GENDER_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" }
];

const AI_TUTOR_LEVELS = [
  { value: "desligado", label: "Desligado" },
  { value: "basico", label: "Básico" },
  { value: "detalhado", label: "Detalhado" }
];

export function CaseProfileForm({ onCreated }: { onCreated?: () => void }) {
  // Listas vindas do banco para selects
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [difficulties, setDifficulties] = useState<{id: number, level: number, description: string | null}[]>([]);
  // Form fields
  const [form, setForm] = useState({
    category_id: "",
    difficulty_level: "",
    points: "10",
    modality: "",
    subtype: "",
    title: "",
    findings: "",
    patient_age: "",
    patient_gender: "",
    symptoms_duration: "",
    patient_clinical_info: "",
    main_question: "",
    explanation: "",
    answer_options: ["", "", "", ""],
    answer_feedbacks: ["", "", "", ""],
    answer_short_tips: ["", "", "", ""], // NOVO
    correct_answer_index: 0,
    image_url: "",
    // Novos campos
    can_skip: true,
    max_elimination: 0,
    ai_hint_enabled: false,
    manual_hint: "",
    skip_penalty_points: 0,
    elimination_penalty_points: 0,
    ai_tutor_level: "desligado"
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Lógica para sugestão automática de pontos conforme dificuldade
  function suggestPointsByDifficulty(level: string) {
    switch (level) {
      case "1":
        return "10";
      case "2":
        return "20";
      case "3":
        return "30";
      case "4":
        return "50";
      default:
        return "10";
    }
  }

  // Carregar selects de categorias e dificuldades
  useEffect(() => {
    supabase.from("medical_specialties")
      .select("id, name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro carregando especialidades:", error);
        } else {
          setCategories(data || []);
        }
      });
    supabase.from("difficulties")
      .select("id, level, description")
      .order("level", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro carregando dificuldades:", error);
        } else {
          setDifficulties(data || []);
        }
      });
  }, []);

  // --- NOVA FUNÇÃO: AUTO-PREENCHIMENTO DOS CAMPOS BASEADO EM DIAGNÓSTICO ---
  function handleAutoFillCaseDetails() {
    const diag = form.title?.trim() || "Patologia não especificada";
    // Exemplos mock
    const findingsExamples: Record<string, string> = {
      "Pneumonia": "Infiltrado pulmonar difuso em lobo inferior direito, broncogramas aéreos visíveis.",
      "DPOC": "Hipertransparência pulmonar, achatamento de diafragma, aumento do espaço retroesternal.",
      "Tuberculose": "Opacidades apicais bilaterais, cavitação no ápice direito.",
      "Parada Cardíaca": "Cardiomegalia com congestão pulmonar, linhas B de Kerley.",
      "Patologia não especificada": "Opacidade focal não especificada nos campos pulmonares."
    };
    const summaryExamples: Record<string, string> = {
      "Pneumonia": "Paciente de 39 anos, sexo masculino, há 4 dias com febre, tosse produtiva e dor torácica.",
      "DPOC": "Homem de 60 anos, tabagista, quadro de dispneia progressiva e tosse crônica.",
      "Tuberculose": "Mulher, 43 anos, emagrecimento, sudorese noturna e tosse há 3 semanas.",
      "Parada Cardíaca": "Homem 52 anos, hipertenso, apresenta dispneia intensa e ortopneia.",
      "Patologia não especificada": "Quadro clínico compatível com doença pulmonar não especificada."
    };

    // Mock automação dos campos avançados:
    const advancedMock = {
      can_skip: Math.random() < 0.5, // aleatório true/false
      max_elimination: 2,
      ai_hint_enabled: Math.random() < 0.7, // mais provável ativado
      skip_penalty_points: 5,
      elimination_penalty_points: 3,
      ai_tutor_level: ["desligado", "basico", "detalhado"][Math.floor(Math.random() * 3)]
    };

    // Preenchimento aleatório permanecem iguais:
    const randomAge = Math.floor(Math.random() * 50) + 20;
    const genders = ["Masculino", "Feminino", "Outro"];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    const symptomExamples = ["3 dias", "1 semana", "2 semanas", "5 dias"];
    const randomSymptoms = symptomExamples[Math.floor(Math.random() * symptomExamples.length)];

    setForm(prev => ({
      ...prev,
      findings: findingsExamples[diag] || findingsExamples["Patologia não especificada"],
      patient_clinical_info: summaryExamples[diag] || summaryExamples["Patologia não especificada"],
      patient_age: String(randomAge),
      patient_gender: randomGender,
      symptoms_duration: randomSymptoms,
      // opções AVANÇADAS automáticas
      can_skip: advancedMock.can_skip,
      max_elimination: advancedMock.max_elimination,
      ai_hint_enabled: advancedMock.ai_hint_enabled,
      skip_penalty_points: advancedMock.skip_penalty_points,
      elimination_penalty_points: advancedMock.elimination_penalty_points,
      ai_tutor_level: advancedMock.ai_tutor_level
      // Não preenche manual_hint para deixar para o botão separado (ajustes finos)
    }));
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target as any;
    if (name === "difficulty_level") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        points: suggestPointsByDifficulty(value),
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleModalityChange(val: { modality: string; subtype: string }) {
    setForm((prev) => ({ ...prev, modality: val.modality, subtype: val.subtype }));
  }

  function handleOptionChange(idx: number, val: string) {
    setForm((prev) => {
      const opts = [...prev.answer_options];
      opts[idx] = val;
      return { ...prev, answer_options: opts };
    });
  }
  function handleOptionFeedbackChange(idx: number, val: string) {
    setForm((prev) => {
      const arr = [...prev.answer_feedbacks];
      arr[idx] = val;
      return { ...prev, answer_feedbacks: arr };
    });
  }
  function handleShortTipChange(idx: number, val: string) {
    setForm((prev) => {
      const arr = [...prev.answer_short_tips];
      arr[idx] = val;
      return { ...prev, answer_short_tips: arr };
    });
  }
  function handleCorrectChange(idx: number) {
    setForm((prev) => ({ ...prev, correct_answer_index: idx }));
  }
  function handleImageChange(url: string | null) {
    setForm((prev) => ({ ...prev, image_url: url || "" }));
  }

  // Botão: Sugerir título (futuro: chamar IA ou API - atualmente só placeholder)
  async function handleSuggestTitle() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir um título." });
      return;
    }
    // Placeholder: apenas exemplo de sugestão.
    setForm(prev => ({ ...prev, title: "Título sugerido pelo sistema (placeholder)" }));
    toast({ description: "Título sugerido automaticamente (personalize se desejar)." });
  }

  // Botão: Gerar alternativas (futuro: chamar IA ou API - atualmente só placeholder)
  async function handleSuggestAlternatives() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e Resumo Clínico para gerar alternativas." });
      return;
    }
    // Placeholder: apenas exemplo de sugestão.
    setForm(prev => ({
      ...prev,
      answer_options: [
        "Diagnóstico A (sugerido pela IA)",
        "Diagnóstico B (sugerido pela IA)",
        "Diagnóstico C (sugerido pela IA)",
        "Diagnóstico D (sugerido pela IA)"
      ],
      correct_answer_index: 0
    }));
    toast({ description: "Alternativas sugeridas automaticamente (personalize se desejar)." });
  }

  // --- NOVO: Gerar dica automaticamente (placeholder para IA futura) ---
  async function handleSuggestHint() {
    if (!form.findings && !form.patient_clinical_info) {
      toast({ description: "Preencha Achados Radiológicos e/ou Resumo Clínico para sugerir uma dica." });
      return;
    }
    setForm(prev => ({ ...prev, manual_hint: "Dica gerada automaticamente (placeholder IA)." }));
    toast({ description: "Dica sugerida automaticamente (futuramente via IA, edite se desejar)." });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload: any = {
      specialty: categories.find(c => String(c.id) === form.category_id)?.name || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      difficulty_level: form.difficulty_level ? Number(form.difficulty_level) : null,
      points: form.points ? Number(form.points) : null,
      modality: form.modality || null,
      subtype: form.subtype || null,
      title: form.title,
      findings: form.findings,
      patient_age: form.patient_age,
      patient_gender: form.patient_gender,
      symptoms_duration: form.symptoms_duration,
      patient_clinical_info: form.patient_clinical_info,
      main_question: form.main_question,
      explanation: form.explanation,
      answer_options: form.answer_options,
      answer_feedbacks: form.answer_feedbacks,
      answer_short_tips: form.answer_short_tips,
      correct_answer_index: form.correct_answer_index,
      image_url: form.image_url,
      // Novos campos
      can_skip: form.can_skip,
      max_elimination: form.max_elimination,
      ai_hint_enabled: form.ai_hint_enabled,
      manual_hint: form.manual_hint,
      skip_penalty_points: form.skip_penalty_points,
      elimination_penalty_points: form.elimination_penalty_points,
      ai_tutor_level: form.ai_tutor_level,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    Object.keys(payload).forEach(k => {
      if (typeof payload[k] === "string" && payload[k] === "") payload[k] = null;
    });

    const { error } = await supabase.from("medical_cases").insert([payload]);
    if (!error) {
      setFeedback("Caso cadastrado com sucesso!");
      setForm({
        category_id: "",
        difficulty_level: "",
        points: "10",
        modality: "",
        subtype: "",
        title: "",
        findings: "",
        patient_age: "",
        patient_gender: "",
        symptoms_duration: "",
        patient_clinical_info: "",
        main_question: "",
        explanation: "",
        answer_options: ["", "", "", ""],
        answer_feedbacks: ["", "", "", ""],
        answer_short_tips: ["", "", "", ""],
        correct_answer_index: 0,
        image_url: "",
        can_skip: true,
        max_elimination: 0,
        ai_hint_enabled: false,
        manual_hint: "",
        skip_penalty_points: 0,
        elimination_penalty_points: 0,
        ai_tutor_level: "desligado"
      });
      onCreated?.();
    } else {
      setFeedback("Erro ao cadastrar caso.");
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(""), 2300);
  }

  return (
    <form className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto space-y-5" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-2">Criar Novo Caso Médico</h2>
      {/* Linha Categoria/Dificuldade/Pontos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div>
          <label className="font-semibold block">Categoria *</label>
          <select
            className="w-full border rounded px-2 py-2 bg-white"
            name="category_id"
            value={form.category_id}
            onChange={handleFormChange}
            required
          >
            <option value="">Selecione a categoria</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold block">Dificuldade *</label>
          <select
            className="w-full border rounded px-2 py-2 bg-white"
            name="difficulty_level"
            value={form.difficulty_level}
            onChange={handleFormChange}
            required
          >
            <option value="">Selecione a dificuldade</option>
            {difficulties.map(d => (
              <option key={d.id} value={d.level}>
                {d.description ? `${d.level} - ${d.description}` : d.level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold block">Pontos *</label>
          <Input
            name="points"
            type="number"
            value={form.points}
            min={1}
            onChange={handleFormChange}
            placeholder="Ex: 10"
            required
          />
        </div>
      </div>

      {/* Campos Modalidade/Subtipo */}
      <CaseModalityFields value={{ modality: form.modality, subtype: form.subtype }} onChange={handleModalityChange} />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              {/* LABEL "Diagnóstico" e observação */}
              <label className="font-semibold">
                Diagnóstico*{" "}
                <span className="text-xs text-muted-foreground">(Não será exibido ao usuário, apenas referência interna)</span>
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Ex: Tuberculose pulmonar"
                required
              />
            </div>
            {/* Botão Sugerir Título (mantido) */}
            <Button type="button" onClick={handleSuggestTitle} variant="secondary" className="mb-1">
              Sugerir Diagnóstico
            </Button>
            {/* NOVO botão Auto-preencher */}
            <Button
              type="button"
              onClick={handleAutoFillCaseDetails}
              variant="secondary"
              className="mb-1"
              title="Preencher achados, resumo, idade, gênero, sintomas e opções avançadas de forma automática"
            >
              Auto-preencher detalhes do caso
            </Button>
          </div>
          <label className="font-semibold mt-3">Achados radiológicos *</label>
          <Textarea name="findings" value={form.findings} onChange={handleFormChange} placeholder="Descreva os achados..." required />

          <label className="font-semibold mt-3">Resumo Clínico *</label>
          <Textarea name="patient_clinical_info" value={form.patient_clinical_info} onChange={handleFormChange} placeholder="Breve histórico do paciente..." required />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            <div>
              <label className="font-semibold">Idade</label>
              <Input name="patient_age" value={form.patient_age} onChange={handleFormChange} placeholder="Ex: 37" />
            </div>
            <div>
              <label className="font-semibold">Gênero</label>
              <select
                className="w-full border rounded px-2 py-2 bg-white"
                name="patient_gender"
                value={form.patient_gender}
                onChange={handleFormChange}
              >
                {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold">Duração dos sintomas</label>
              <Input name="symptoms_duration" value={form.symptoms_duration} onChange={handleFormChange} placeholder="Ex: 1 semana" />
            </div>
          </div>
        </div>
        <div className="pt-3 min-w-[240px] flex flex-col items-center">
          <ImageUploadWithZoom value={form.image_url} onChange={handleImageChange} />
        </div>
      </div>
      <label className="font-semibold block mt-3">Pergunta Principal *</label>
      <Input name="main_question" value={form.main_question} onChange={handleFormChange} placeholder="Ex: Qual é o diagnóstico mais provável?" required />
      
      <div>
        <div className="flex items-end gap-2 mb-1">
          <label className="font-semibold">Alternativas do Quiz *</label>
          <Button type="button" onClick={handleSuggestAlternatives} variant="secondary">
            Gerar Alternativas
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {["A", "B", "C", "D"].map((letter, idx) => (
            <div key={idx} className="flex flex-col border rounded-lg px-4 py-2 gap-2 bg-gray-50">
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
              {/* --- NOVO campo: short_tip --- */}
              <Input
                value={form.answer_short_tips[idx]}
                onChange={e => handleShortTipChange(idx, e.target.value)}
                placeholder={`Meta-dica para alternativa ${letter} (opcional, ex: "Confunde com doença X")`}
                className="text-xs"
                maxLength={80}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="font-semibold">Explicação e Feedback Geral *</label>
        <Textarea name="explanation" value={form.explanation} onChange={handleFormChange} placeholder="Explique o caso e a resposta correta..." required />
      </div>
      {/* ================== SEÇÃO AVANÇADA ===================== */}
      <div className="mt-7">
        <button
          type="button"
          className="text-cyan-700 font-semibold hover:underline"
          onClick={() => setShowAdvanced(v => !v)}
        >
          {showAdvanced ? "Ocultar" : "Mostrar"} Configurações Avançadas
        </button>
        {showAdvanced && (
          <div className="border rounded-lg p-4 bg-gray-50 mt-3 space-y-4">
            {/* NOVO botão para gerar configurações avançadas a partir dos dados já preenchidos */}
            <div className="flex mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFillCaseDetails}
                title="Sugerir configuração avançada automaticamente via IA/api (mock)"
              >
                Gerar configurações avançadas automaticamente
              </Button>
            </div>
            {/* ... keep existing code (os campos avançados em grid) the same ... */}
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
                  max={form.answer_options.length - 2}
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
        )}
      </div>
      {/* ================== FIM SEÇÃO AVANÇADA ===================== */}

      <Button type="submit" disabled={submitting}>Salvar Caso</Button>
      {feedback && (
        <span className="ml-4 text-sm font-medium text-cyan-700">{feedback}</span>
      )}
    </form>
  );
}
