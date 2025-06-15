
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Plus } from "lucide-react";

// Utilitários para listar opções
async function fetchCategories() {
  const { data, error } = await supabase.from("case_categories").select("*").order("name");
  return data || [];
}

async function fetchModalities() {
  const { data, error } = await supabase.from("imaging_modalities").select("*").order("name");
  return data || [];
}

async function fetchSubtypes(modalityId: number | null) {
  if (!modalityId) return [];
  const { data, error } = await supabase
    .from("imaging_subtypes")
    .select("*")
    .eq("modality_id", modalityId)
    .order("name");
  return data || [];
}

// Página principal
export default function CasosMedicos() {
  const [categories, setCategories] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [selectedModality, setSelectedModality] = useState<number | null>(null);

  // Form State (só campos principais para exibir)
  const [form, setForm] = useState({
    title: "",
    category_id: "",
    main_modality_id: "",
    subtype_id: "",
    difficulty_level: "",
    patient_age: "",
    patient_gender: "",
  });

  // Listagem de casos já cadastrados (simplificado)
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load options
  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchModalities().then(setModalities);
  }, []);

  useEffect(() => {
    if (selectedModality) {
      fetchSubtypes(selectedModality).then(setSubtypes);
    } else {
      setSubtypes([]);
    }
  }, [selectedModality]);

  // Carrega todos casos médicos (listagem simplificada)
  useEffect(() => {
    setLoading(true);
    supabase.from("medical_cases")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCases(data || []);
        setLoading(false);
      });
  }, []);

  // Handlers
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "main_modality_id") {
      setSelectedModality(Number(value) || null);
      setForm((prev) => ({ ...prev, subtype_id: "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Simples: só campos principais (adapte depois para todos os campos!)
    const { error } = await supabase.from("medical_cases").insert({
      title: form.title,
      category_id: form.category_id ? Number(form.category_id) : null,
      main_modality_id: form.main_modality_id ? Number(form.main_modality_id) : null,
      subtype_id: form.subtype_id ? Number(form.subtype_id) : null,
      difficulty_level: form.difficulty_level ? Number(form.difficulty_level) : null,
      patient_age: form.patient_age,
      patient_gender: form.patient_gender,
      created_at: new Date(),
      updated_at: new Date(),
    });
    if (!error) {
      // reload listagem
      const { data } = await supabase.from("medical_cases").select("id, title, created_at").order("created_at", { ascending: false });
      setCases(data || []);
      setForm({
        title: "",
        category_id: "",
        main_modality_id: "",
        subtype_id: "",
        difficulty_level: "",
        patient_age: "",
        patient_gender: "",
      });
      setSelectedModality(null);
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Plus className="text-cyan-600" /> Cadastrar Novo Caso Médico-Radiológico
      </h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-10 flex flex-col gap-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Título *</label>
            <Input name="title" value={form.title} onChange={handleFormChange} required />
          </div>
          <div>
            <label className="font-semibold">Categoria *</label>
            <select className="w-full border rounded px-2 py-2" name="category_id" value={form.category_id} onChange={handleFormChange} required>
              <option value="">Selecione...</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Modalidade *</label>
            <select className="w-full border rounded px-2 py-2" name="main_modality_id" value={form.main_modality_id} onChange={handleFormChange} required>
              <option value="">Selecione...</option>
              {modalities.map((mod: any) => (
                <option key={mod.id} value={mod.id}>{mod.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Subtipo</label>
            <select className="w-full border rounded px-2 py-2" name="subtype_id" value={form.subtype_id} onChange={handleFormChange} disabled={!selectedModality}>
              <option value="">Selecione...</option>
              {subtypes.map((sub: any) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold">Dificuldade</label>
            <select className="w-full border rounded px-2 py-2" name="difficulty_level" value={form.difficulty_level} onChange={handleFormChange}>
              <option value="">Selecione...</option>
              <option value="1">Fácil</option>
              <option value="2">Média</option>
              <option value="3">Difícil</option>
            </select>
          </div>
          <div>
            <label className="font-semibold">Idade do Paciente</label>
            <Input name="patient_age" value={form.patient_age} onChange={handleFormChange} />
          </div>
          <div>
            <label className="font-semibold">Sexo do Paciente</label>
            <select className="w-full border rounded px-2 py-2" name="patient_gender" value={form.patient_gender} onChange={handleFormChange}>
              <option value="">Selecione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        <div>
          <Button type="submit" disabled={loading}>Salvar Caso</Button>
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
