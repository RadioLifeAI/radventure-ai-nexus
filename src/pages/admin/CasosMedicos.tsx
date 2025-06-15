
import React, { useEffect, useState } from "react";
import { CaseProfileForm } from "./components/CaseProfileForm";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";

// --- MOCK DATA: definir fora do componente para não re-criar a cada render
const MOCK_CASES = [
  {
    category_id: 1,
    difficulty_level: 1,
    points: 10,
    modality: "Raio-X",
    subtype: "Tórax",
    title: "Pneumonia Lobar Direita",
    findings: "Infiltrado homogêneo em lobo inferior direito, broncogramas aéreos presentes.",
    patient_age: "43",
    patient_gender: "Masculino",
    symptoms_duration: "5 dias",
    patient_clinical_info: "Paciente masculino, 43 anos, febre alta, dor torácica e tosse produtiva.",
    main_question: "Qual o diagnóstico provável para a imagem?",
    explanation: "O padrão de infiltrado e sintomas são típicos de pneumonia bacteriana.",
    answer_options: ["Pneumonia", "DPOC", "Tuberculose", "Atelectasia"],
    answer_feedbacks: ["Correto, trata-se de pneumonia.", "Incorreto, ausência de sinais de DPOC.", "Sem sinais clássicos de TB.", "A distribuição do infiltrado não sugere atelectasia."],
    answer_short_tips: ["Clássico de pneumonia", "DPOC = hiperinsuflação", "Tuberculose geralmente apical", "Atelectasia reabsorção"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 1,
    ai_hint_enabled: true,
    manual_hint: "Observe o padrão do infiltrado.",
    skip_penalty_points: 2,
    elimination_penalty_points: 1,
    ai_tutor_level: "basico"
  },
  {
    category_id: 2,
    difficulty_level: 2,
    points: 20,
    modality: "TC",
    subtype: "Crânio",
    title: "AVC isquêmico agudo",
    findings: "Hipodensidade em região frontal esquerda, apagamento de sulcos corticais adjacentes.",
    patient_age: "68",
    patient_gender: "Feminino",
    symptoms_duration: "3 horas",
    patient_clinical_info: "Mulher, 68 anos, início súbito de hemiparesia à direita.",
    main_question: "O que melhor explica os achados do exame?",
    explanation: "Alterações sugestivas de AVC isquêmico na fase aguda.",
    answer_options: ["AVC Isquêmico", "AVC Hemorrágico", "Encefalite", "Tumor"],
    answer_feedbacks: ["Correto, típico de AVC agudo.", "Sem sinais hemorrágicos.", "Sem realce ou sinais infecciosos.", "Lesão mal delimitada para tumor."],
    answer_short_tips: ["Hipodensidade sem sangue", "Ausência de hematoma", "Sem sinais infecciosos", "Tumor normalmente subagudo"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 2,
    ai_hint_enabled: false,
    manual_hint: "Fique atento ao tempo de evolução.",
    skip_penalty_points: 3,
    elimination_penalty_points: 1,
    ai_tutor_level: "desligado"
  },
  {
    category_id: 3,
    difficulty_level: 1,
    points: 10,
    modality: "Ultrassom",
    subtype: "Abdome",
    title: "Colelitíase",
    findings: "Presença de múltiplos cálculos hiperecogênicos com sombra acústica em vesícula.",
    patient_age: "35",
    patient_gender: "Feminino",
    symptoms_duration: "3 dias",
    patient_clinical_info: "Mulher, 35 anos, dor em hipocôndrio direito após alimentação gordurosa.",
    main_question: "Qual achado é esperado nesse exame?",
    explanation: "A sombra acústica posterior apoia o diagnóstico de cálculos.",
    answer_options: ["Sombra acústica posterior", "Obstrução do ducto pancreático", "Dilatacao das vias biliares", "Colecistite enfisematosa"],
    answer_feedbacks: ["Correto.", "Incorreto.", "Nessa fase ainda não.", "Caso grave, ausência de gás."],
    answer_short_tips: ["Sombra = cálculo", "Obstrução = icterícia", "Dilatação = progressão", "Enfisematosa = gás"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: false,
    max_elimination: 0,
    ai_hint_enabled: false,
    manual_hint: "",
    skip_penalty_points: 0,
    elimination_penalty_points: 0,
    ai_tutor_level: "desligado"
  },
  {
    category_id: 1,
    difficulty_level: 2,
    points: 20,
    modality: "Raio-X",
    subtype: "Tórax",
    title: "DPOC com hiperinsuflação pulmonar",
    findings: "Achatamento de diafragma, aumento do espaço retroesternal, campos pulmonares hiperclaros.",
    patient_age: "60",
    patient_gender: "Masculino",
    symptoms_duration: "1 mês",
    patient_clinical_info: "Homem, 60 anos, tabagista, dispneia progressiva.",
    main_question: "Qual alteração radiológica é sugestiva?",
    explanation: "Soma de achados indica hiperinsuflação típica do DPOC.",
    answer_options: ["Achatamento diafragma", "Opacidade apical", "Derrame pleural", "Aumento cardíaco"],
    answer_feedbacks: ["Correta.", "Não é achado esperado aqui.", "Não existe derrame.", "Cardiomegalia não típica no DPOC."],
    answer_short_tips: ["DPOC = hiperinsuflação", "Opacidade apical = TB", "Derrame = líquido", "Coração grande não é regra"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 1,
    ai_hint_enabled: true,
    manual_hint: "Pense nos efeitos do tabagismo.",
    skip_penalty_points: 2,
    elimination_penalty_points: 1,
    ai_tutor_level: "basico"
  },
  {
    category_id: 4,
    difficulty_level: 3,
    points: 30,
    modality: "Ressonância",
    subtype: "Craniana",
    title: "Esclerose Múltipla",
    findings: "Lesões hiperintensas em T2, distribuição periventricular.",
    patient_age: "29",
    patient_gender: "Feminino",
    symptoms_duration: "2 semanas",
    patient_clinical_info: "Mulher de 29 anos, episódios de visão turva, fraqueza muscular.",
    main_question: "Qual o diagnóstico MAIS provável?",
    explanation: "Distribuição e clínica condizem com esclerose múltipla.",
    answer_options: ["Esclerose múltipla", "Tumor cerebral", "Infarto", "Hematoma"],
    answer_feedbacks: ["Correto.", "Sem lesão expansiva.", "Sem sinais de AVC.", "Sem sinais hemorrágicos."],
    answer_short_tips: ["Placas periventriculares", "Tumor ocupa espaço", "Infarto = agudo", "Hematoma sangue"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 2,
    ai_hint_enabled: true,
    manual_hint: "",
    skip_penalty_points: 3,
    elimination_penalty_points: 2,
    ai_tutor_level: "detalhado"
  },
  {
    category_id: 2,
    difficulty_level: 1,
    points: 10,
    modality: "TC",
    subtype: "Tórax",
    title: "Embolia Pulmonar",
    findings: "Defeito de enchimento em artéria pulmonar segmentar direita.",
    patient_age: "48",
    patient_gender: "Masculino",
    symptoms_duration: "1 dia",
    patient_clinical_info: "Homem, 48 anos, dispneia súbita e dor torácica pleurítica.",
    main_question: "O que o achado sugere?",
    explanation: "Defeito típico de embolia pulmonar.",
    answer_options: ["Embolia pulmonar", "Infarto do miocárdio", "Pneumonia viral", "Fibrose"],
    answer_feedbacks: ["Correto.", "Exame não mostra coração.", "Padrão não viral.", "Fibrose é crônica."],
    answer_short_tips: ["Atenção vasos", "Miocárdio = ECG", "Pneumonia viral = infiltração", "Fibrose não aguda"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 2,
    ai_hint_enabled: false,
    manual_hint: "",
    skip_penalty_points: 2,
    elimination_penalty_points: 1,
    ai_tutor_level: "basico"
  },
  {
    category_id: 3,
    difficulty_level: 2,
    points: 15,
    modality: "Ultrassom",
    subtype: "Abdome",
    title: "Apendicite Aguda",
    findings: "Estrutura tubular não compressível, diâmetro aumentado, reação inflamatória periapendicular.",
    patient_age: "21",
    patient_gender: "Masculino",
    symptoms_duration: "2 dias",
    patient_clinical_info: "Homem, 21 anos, dor em fossa ilíaca direita.",
    main_question: "O que melhor define esse exame?",
    explanation: "Ultrassom caracteriza perfeitamente apendicite em jovem.",
    answer_options: ["Apendicite Aguda", "Colecistite", "Diverticulite", "Pancreatite"],
    answer_feedbacks: ["Correto.", "Errado órgão.", "Outra topografia.", "Pancreatite sem dor fossa ilíaca."],
    answer_short_tips: ["Jovens", "Colecistite = vesícula", "Diverticulite = cólon", "Pancreatite = epigástrio"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: false,
    max_elimination: 0,
    ai_hint_enabled: false,
    manual_hint: "Procure o sinal do alvo.",
    skip_penalty_points: 0,
    elimination_penalty_points: 0,
    ai_tutor_level: "basico"
  },
  {
    category_id: 4,
    difficulty_level: 2,
    points: 18,
    modality: "Ressonância",
    subtype: "Abdome",
    title: "Lesão focal hepática benigna",
    findings: "Lesão arredondada, realce homogêneo ao contraste, bordas bem definidas.",
    patient_age: "54",
    patient_gender: "Feminino",
    symptoms_duration: "1 semana",
    patient_clinical_info: "Mulher, 54 anos, exame de rotina, nenhum sintoma.",
    main_question: "Qual a principal hipótese diagnóstica?",
    explanation: "Aspecto típico de hemangioma hepático.",
    answer_options: ["Hemangioma", "Metástase", "Hepatocarcinoma", "Abscesso"],
    answer_feedbacks: ["Correto.", "Aparência não metastática.", "Ausência de sinais malignos.", "Sem reação inflamatória."],
    answer_short_tips: ["Hemangioma = homogêneo", "Metástase múltipla", "Maligno = irregular", "Abscesso = inflamação"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 1,
    ai_hint_enabled: false,
    manual_hint: "",
    skip_penalty_points: 2,
    elimination_penalty_points: 1,
    ai_tutor_level: "desligado"
  },
  {
    category_id: 3,
    difficulty_level: 1,
    points: 10,
    modality: "Ultrassom",
    subtype: "Tireoide",
    title: "Nódulo tireoidiano benigno",
    findings: "Nódulo sólido, isoecogênico, bordas regulares, halo periférico.",
    patient_age: "41",
    patient_gender: "Feminino",
    symptoms_duration: "8 meses",
    patient_clinical_info: "Paciente feminina, 41 anos, nódulo palpável indolor.",
    main_question: "O que sugere benignidade nesse caso?",
    explanation: "Ecogenicidade e padrões sugerem benignidade.",
    answer_options: ["Isoecogenicidade", "Microcalcificações", "Bordas irregulares", "Invasão de vasos"],
    answer_feedbacks: ["Correto.", "Microcalcificações = suspeita.", "Irregular = suspeito.", "Invasão = maligno."],
    answer_short_tips: ["Isoeco = benigno", "Microcal = maligno", "Bordas = olhar padrão", "Invasão = ruim"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 1,
    ai_hint_enabled: false,
    manual_hint: "",
    skip_penalty_points: 1,
    elimination_penalty_points: 0,
    ai_tutor_level: "desligado"
  },
  {
    category_id: 2,
    difficulty_level: 3,
    points: 30,
    modality: "TC",
    subtype: "Abdome",
    title: "Diverticulite",
    findings: "Espessamento parietal de cólon sigmoide, infiltração da gordura pericólica.",
    patient_age: "59",
    patient_gender: "Masculino",
    symptoms_duration: "3 dias",
    patient_clinical_info: "Homem, 59 anos, dor abdominal em fossa ilíaca esquerda.",
    main_question: "Qual diagnóstico o exame indica?",
    explanation: "Espessamento e inflamação sugerem diverticulite.",
    answer_options: ["Diverticulite", "Neoplasia", "Colite ulcerativa", "Megacólon"],
    answer_feedbacks: ["Correto.", "Massa tumoral normalmente irregular.", "Colite = mucosa apenas.", "Megacólon = dilatação sem inflamação."],
    answer_short_tips: ["Inflamação aguda", "Massa? pensar neoplasia", "Colite = mucosa", "Megacólon é dilatação"],
    correct_answer_index: 0,
    image_url: "",
    can_skip: true,
    max_elimination: 2,
    ai_hint_enabled: true,
    manual_hint: "Procure sinais de perfuração.",
    skip_penalty_points: 4,
    elimination_penalty_points: 3,
    ai_tutor_level: "detalhado"
  }
];

export default function CasosMedicos() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- ADICIONAR CASOS FAKE APENAS UMA VEZ (verifica pela existência do título do primeiro mock) ---
  useEffect(() => {
    setLoading(true);

    async function maybeInsertMockCases() {
      // Veja se o primeiro caso mock já existe para evitar duplicatas
      const { data: existing } = await supabase
        .from("medical_cases")
        .select("id")
        .eq("title", MOCK_CASES[0].title);
      if (!existing || existing.length === 0) {
        // Insere todos os mocks de uma vez
        await supabase.from("medical_cases").insert(
          MOCK_CASES.map(c => ({
            ...c,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        );
      }
    }

    maybeInsertMockCases().then(() => {
      supabase.from("medical_cases")
        .select("id, title, created_at, image_url")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setCases(data || []);
          setLoading(false);
        });
    });
  }, []);

  function refreshCases() {
    setLoading(true);
    supabase.from("medical_cases").select("id, title, created_at, image_url").order("created_at", { ascending: false })
      .then(({ data }) => {
        setCases(data || []);
        setLoading(false);
      });
  }

  return (
    <div>
      <CaseProfileForm onCreated={refreshCases} />
      <h3 className="text-xl font-bold mb-3 mt-12">Casos Cadastrados</h3>
      <div className="bg-white rounded shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                <TableCell>
                  {item.image_url ? (
                    <img src={item.image_url} alt="img" className="w-14 h-14 object-cover rounded" />
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString("pt-BR") : ""}</TableCell>
              </TableRow>
            ))}
            {!cases.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum caso cadastrado ainda.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
