
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Sparkles } from "lucide-react";

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
    // Pega o nome da modalidade também para sugestão de título
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
      // Salva também os nomes para facilitar sugestão de título
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
    // Sugere título básico usando categoria e modalidade, incrementando com número random
    const cat = form.category_name || categories.find((c) => String(c.id) === form.category_id)?.name || "";
    const mod = form.main_modality_name || modalities.find((m) => String(m.id) === form.main_modality_id)?.name || "";
    const suffix = getSuffixByCategory(cat) || "";
    const randomId = Math.floor(Math.random() * 1000);
    const suggestion = `Caso ${suffix}${mod ? ` - ${mod}` : ""} #${randomId}`;
    setTitleSuggested(suggestion);
    setForm((prev) => ({ ...prev, title: suggestion }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Monta objeto para o banco, apenas colunas reais
    const insertObj: any = {
      title: form.title,
      // Campos opcionais, só envia se tiver valor
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Categoria *</label>
            <select className="w-full border rounded px-2 py-2"
              name="category_id" value={form.category_id} onChange={handleFormChange} required>
              <option value="">Selecione a categoria</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Modalidade Principal *</label>
            <select className="w-full border rounded px-2 py-2"
              name="main_modality_id" value={form.main_modality_id} onChange={handleFormChange} required>
              <option value="">Selecione a modalidade</option>
              {modalities.map((mod: any) => (
                <option key={mod.id} value={mod.id}>{mod.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Subtipo</label>
            <select className="w-full border rounded px-2 py-2"
              name="subtype_id" value={form.subtype_id} onChange={handleFormChange} disabled={!selectedModality}>
              <option value="">Selecione o subtipo</option>
              {subtypes.map((sub: any) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
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
        {/* ÁREA PARA RESPOSTA/FEEDBACK/COMENTÁRIO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Resposta Esperada</label>
            <textarea
              className="w-full border rounded px-2 py-2 resize-none min-h-[48px]"
              name="resposta"
              value={form.resposta}
              onChange={handleFormChange}
              placeholder="Descreva a resposta esperada para este caso"
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
            <label className="font-semibold">Comentário Final</label>
            <textarea
              className="w-full border rounded px-2 py-2 resize-none min-h-[48px]"
              name="comentario_final"
              value={form.comentario_final}
              onChange={handleFormChange}
              placeholder="Comentário adicional pós-feedback"
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
