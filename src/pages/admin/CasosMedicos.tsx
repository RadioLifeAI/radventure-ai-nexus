import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Sparkles } from "lucide-react";
import { CaseCategoryFields } from "./components/CaseCategoryFields";
import { QuizAnswersFields } from "./components/QuizAnswersFields";

function getSuffixByCategory(categoryName: string) {
  if (!categoryName) return "";
  if (categoryName.toLowerCase().includes("neuro")) return "de Neuro";
  if (categoryName.toLowerCase().includes("abdome")) return "de Abdome";
  if (categoryName.toLowerCase().includes("músculo")) return "Músculo-Esquelético";
  if (categoryName.toLowerCase().includes("cardio")) return "Cardíaco";
  return categoryName;
}

async function fetchCategories() {
  const { data } = await supabase.from("case_categories" as any).select("id, name").order("name");
  return data || [];
}

async function fetchModalities() {
  const { data } = await supabase.from("imaging_modalities").select("id, name").order("name");
  return data || [];
}

async function fetchSubtypes(modalityId: number | null) {
  if (!modalityId) return [];
  const { data } = await supabase
    .from("imaging_subtypes" as any)
    .select("id, name, modality_id")
    .eq("modality_id", modalityId)
    .order("name");
  return data || [];
}

export default function CasosMedicos() {
  const [categories, setCategories] = useState<any[]>([]);
  const [modalities, setModalities] = useState<any[]>([]);
  const [subtypes, setSubtypes] = useState<any[]>([]);
  const [selectedModality, setSelectedModality] = useState<number | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [titleSuggested, setTitleSuggested] = useState("");

  // Estados específicos do quiz
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const [form, setForm] = useState({
    category_id: "",
    category_name: "",
    title: "",
    main_modality_id: "",
    main_modality_name: "",
    subtype_id: "",
    difficulty_level: "",
    patient_age: "",
    patient_gender: "",
    resposta: "",
    feedback: "",
    comentario_final: "",
  });

  // Load options
  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchModalities().then(setModalities);
  }, []);

  useEffect(() => {
    if (selectedModality && modalities.length) {
      const found = modalities.find((m) => m.id == selectedModality);
      setForm((prev) => ({
        ...prev,
        main_modality_id: String(selectedModality),
        main_modality_name: found?.name || "",
      }));
    }
    if (selectedModality) {
      fetchSubtypes(selectedModality).then(setSubtypes);
    } else {
      setSubtypes([]);
    }
  }, [selectedModality, modalities]);

  useEffect(() => {
    setLoading(true);
    supabase.from("medical_cases").select("id, title, created_at").order("created_at", { ascending: false })
      .then(({ data }) => {
        setCases(data || []);
        setLoading(false);
      });
  }, []);

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      let update = { ...prev, [name]: value };
      if (name === "category_id") {
        const cat = categories.find((c) => String(c.id) === String(value));
        update.category_name = cat?.name || "";
      }
      if (name === "main_modality_id") {
        setSelectedModality(Number(value) || null);
      }
      return update;
    });
  }

  function handleSuggestTitle() {
    const cat = form.category_name || categories.find((c) => String(c.id) === form.category_id)?.name || "";
    const mod = form.main_modality_name || modalities.find((m) => String(m.id) === form.main_modality_id)?.name || "";
    const suffix = getSuffixByCategory(cat) || "";
    const randomId = Math.floor(Math.random() * 1000);
    const suggestion = `Caso ${suffix}${mod ? ` - ${mod}` : ""} #${randomId}`;
    setTitleSuggested(suggestion);
    setForm((prev) => ({ ...prev, title: suggestion }));
  }

  // novos handlers para alternativas
  function handleAnswerChange(idx: number, value: string) {
    setAnswers(a => a.map((v, i) => i === idx ? value : v));
  }
  function handleCorrectIndexChange(idx: number) {
    setCorrectIndex(idx);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const insertObj: any = {
      title: form.title,
      // Quiz specifics:
      alternatives: answers,
      alternative_correct_index: correctIndex,
      // Banco:
      category_id: form.category_id ? Number(form.category_id) : null,
      main_modality_id: form.main_modality_id ? Number(form.main_modality_id) : null,
      subtype_id: form.subtype_id ? Number(form.subtype_id) : null,
      difficulty_level: form.difficulty_level ? Number(form.difficulty_level) : null,
      patient_age: form.patient_age || null,
      patient_gender: form.patient_gender || null,
      resposta: form.resposta || null,
      feedback: form.feedback || null,
      comentario_final: form.comentario_final || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    Object.keys(insertObj).forEach(
      k => { if (insertObj[k] === "") insertObj[k] = null; }
    );

    const { error } = await supabase.from("medical_cases").insert([insertObj]);
    if (!error) {
      setFeedback("Caso cadastrado com sucesso!");
      const { data } = await supabase.from("medical_cases").select("id, title, created_at").order("created_at", { ascending: false });
      setCases(data || []);
      setForm({
        category_id: "",
        category_name: "",
        title: "",
        main_modality_id: "",
        main_modality_name: "",
        subtype_id: "",
        difficulty_level: "",
        patient_age: "",
        patient_gender: "",
        resposta: "",
        feedback: "",
        comentario_final: "",
      });
      setSelectedModality(null);
      setTitleSuggested("");
      setAnswers(["", "", "", ""]);
      setCorrectIndex(0);
      setTimeout(() => setFeedback(""), 1800);
    } else {
      setFeedback("Erro ao cadastrar o caso.");
      setTimeout(() => setFeedback(""), 2200);
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Plus className="text-cyan-600" /> Criar Novo Caso Médico
      </h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-10 flex flex-col gap-4 max-w-4xl">
        {/* CATEGORIAS, MODALIDADE, SUBTIPO */}
        <CaseCategoryFields
          categories={categories}
          modalities={modalities}
          subtypes={subtypes}
          selectedModality={selectedModality}
          form={form}
          handleFormChange={handleFormChange}
        />
        {/* DIFICULDADE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Dificuldade</label>
            <select className="w-full border rounded px-2 py-2"
              name="difficulty_level" value={form.difficulty_level} onChange={handleFormChange}>
              <option value="">Selecione...</option>
              <option value="1">Fácil</option>
              <option value="2">Média</option>
              <option value="3">Difícil</option>
            </select>
          </div>
          {/* TÍTULO COM SUGESTÃO */}
          <div>
            <label className="font-semibold">Título do Caso</label>
            <div className="flex gap-2">
              <Input name="title" value={form.title} onChange={handleFormChange} placeholder="Ex: Caso de Neuro #951" required />
              <Button variant="ghost" type="button" onClick={handleSuggestTitle} title="Sugerir Título">
                <Sparkles className="text-cyan-600" size={20} />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">{titleSuggested && `Sugerido: ${titleSuggested}`}</span>
          </div>
        </div>
        <hr className="my-2"/>
        {/* ALTERNATIVAS DO QUIZ */}
        <QuizAnswersFields
          answers={answers}
          correctIndex={correctIndex}
          handleAnswerChange={handleAnswerChange}
          handleCorrectIndexChange={handleCorrectIndexChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Idade do Paciente</label>
            <Input name="patient_age" value={form.patient_age} onChange={handleFormChange} />
          </div>
          <div>
            <label className="font-semibold">Sexo do Paciente</label>
            <select className="w-full border rounded px-2 py-2"
              name="patient_gender" value={form.patient_gender} onChange={handleFormChange}>
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        {/* FEEDBACK/COMENTÁRIO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Comentário Final</label>
            <textarea
              className="w-full border rounded px-2 py-2 resize-none min-h-[48px]"
              name="comentario_final"
              value={form.comentario_final}
              onChange={handleFormChange}
              placeholder="Comentário adicional pós-feedback"
            />
          </div>
          <div>
            <label className="font-semibold">Feedback da Resposta</label>
            <textarea
              className="w-full border rounded px-2 py-2 resize-none min-h-[48px]"
              name="feedback"
              value={form.feedback}
              onChange={handleFormChange}
              placeholder="Dê um feedback para esta resposta"
            />
          </div>
          <div>
            <label className="font-semibold">Observação Interna</label>
            <textarea
              className="w-full border rounded px-2 py-2 resize-none min-h-[48px]"
              name="resposta"
              value={form.resposta}
              onChange={handleFormChange}
              placeholder="Observação interna do caso (opcional)"
            />
          </div>
        </div>
        <div>
          <Button type="submit" disabled={loading}>Salvar Caso</Button>
          {feedback && (
            <span className="ml-4 text-sm font-medium text-cyan-700">{feedback}</span>
          )}
        </div>
      </form>

      <h3 className="text-xl font-bold mb-3">Casos Cadastrados</h3>
      <div className="bg-white rounded shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : ""}</TableCell>
              </TableRow>
            ))}
            {!cases.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">Nenhum caso cadastrado ainda.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
