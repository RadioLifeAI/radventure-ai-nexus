import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadWithZoom } from "./ImageUploadWithZoom";
import { supabase } from "@/integrations/supabase/client";

type Option = { value: string, feedback: string };
const GENDER_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" }
];

export function CaseProfileForm({ onCreated }: { onCreated?: () => void }) {
  // Listas vindas do banco para selects
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [difficulties, setDifficulties] = useState<{id: number, level: number, description: string | null}[]>([]);
  // Form fields
  const [form, setForm] = useState({
    // Novos campos iniciais
    category_id: "",
    difficulty_level: "",
    points: "10",
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
    correct_answer_index: 0,
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Carregar selects de categorias e dificuldades
  useEffect(() => {
    // Carregar categorias
    supabase.from("medical_specialties")
      .select("id, name")
      .then(({ data }) => data && setCategories(data));

    // Carregar níveis de dificuldade
    supabase.from("difficulties")
      .select("id, level, description")
      .order("level", { ascending: true })
      .then(({ data }) => data && setDifficulties(data));
  }, []);

  // Handlers de campo
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
  function handleCorrectChange(idx: number) {
    setForm((prev) => ({ ...prev, correct_answer_index: idx }));
  }
  function handleImageChange(url: string | null) {
    setForm((prev) => ({ ...prev, image_url: url || "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const payload: any = {
      // Campos iniciais
      specialty: categories.find(c => String(c.id) === form.category_id)?.name || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      difficulty_level: form.difficulty_level ? Number(form.difficulty_level) : null,
      points: form.points ? Number(form.points) : null,
      // Restante (restaurei, mantendo)
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
      correct_answer_index: form.correct_answer_index,
      image_url: form.image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Remove string vazia -> null
    Object.keys(payload).forEach(k => {
      if (typeof payload[k] === "string" && payload[k] === "") payload[k] = null;
    });

    // Enviar para tabela medical_cases
    const { error } = await supabase.from("medical_cases").insert([payload]);
    if (!error) {
      setFeedback("Caso cadastrado com sucesso!");
      setForm({
        category_id: "",
        difficulty_level: "",
        points: "10",
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
        correct_answer_index: 0,
        image_url: "",
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
      {/* Campos iniciais - Categoria, Dificuldade, Pontos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div>
          <label className="font-semibold block">Categoria *</label>
          <select
            className="w-full border rounded px-2 py-2"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
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
            className="w-full border rounded px-2 py-2"
            name="difficulty_level"
            value={form.difficulty_level}
            onChange={handleChange}
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
            onChange={handleChange}
            placeholder="Ex: 10"
            required
          />
        </div>
      </div>
      {/* Restante do formulário mantido (título, imagem, achados...) */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <label className="font-semibold">Título *</label>
          <Input name="title" value={form.title} onChange={handleChange} placeholder="Ex: PAF pulmonar em paciente jovem" required />

          <label className="font-semibold mt-3">Achados radiológicos *</label>
          <Textarea name="findings" value={form.findings} onChange={handleChange} placeholder="Descreva os achados..." required />

          <label className="font-semibold mt-3">Resumo Clínico *</label>
          <Textarea name="patient_clinical_info" value={form.patient_clinical_info} onChange={handleChange} placeholder="Breve histórico do paciente..." required />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            <div>
              <label className="font-semibold">Idade</label>
              <Input name="patient_age" value={form.patient_age} onChange={handleChange} placeholder="Ex: 37" />
            </div>
            <div>
              <label className="font-semibold">Gênero</label>
              <select
                className="w-full border rounded px-2 py-2"
                name="patient_gender"
                value={form.patient_gender}
                onChange={handleChange}
              >
                {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold">Duração dos sintomas</label>
              <Input name="symptoms_duration" value={form.symptoms_duration} onChange={handleChange} placeholder="Ex: 1 semana" />
            </div>
          </div>
        </div>
        <div className="pt-3 min-w-[240px] flex flex-col items-center">
          <ImageUploadWithZoom value={form.image_url} onChange={handleImageChange} />
        </div>
      </div>
      <label className="font-semibold block mt-3">Pergunta Principal *</label>
      <Input name="main_question" value={form.main_question} onChange={handleChange} placeholder="Ex: Qual é o diagnóstico mais provável?" required />

      <div>
        <label className="font-semibold">Alternativas do Quiz *</label>
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
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="font-semibold">Explicação e Feedback Geral *</label>
        <Textarea name="explanation" value={form.explanation} onChange={handleChange} placeholder="Explique o caso e a resposta correta..." required />
      </div>
      <Button type="submit" disabled={submitting}>Salvar Caso</Button>
      {feedback && (
        <span className="ml-4 text-sm font-medium text-cyan-700">{feedback}</span>
      )}
    </form>
  );
}
