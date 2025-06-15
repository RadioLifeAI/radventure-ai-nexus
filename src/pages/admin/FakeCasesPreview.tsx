
import React, { useMemo, useState } from "react";

const GENDER_OPTIONS = ["Masculino", "Feminino", "Outro"];

function shuffleAlternatives(arr: string[], correctIdx: number) {
  const paired = arr.map((answer, idx) => ({
    answer,
    idx,
    isCorrect: idx === correctIdx,
  }));
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  const shuffledAnswers = paired.map(p => p.answer);
  const newCorrectIdx = paired.findIndex(p => p.isCorrect);
  return { shuffledAnswers, newCorrectIdx };
}

// Lista estática de 10 casos radiológicos fictícios
const fakeCases = [
  {
    id: 1,
    title: "Pneumonia Lobar Direita",
    findings: "Infiltrado pulmonar denso no lobo inferior direito.",
    patient_clinical_info: "Mulher, 38 anos, tosse produtiva há 4 dias e febre.",
    patient_age: "38",
    patient_gender: "Feminino",
    symptoms_duration: "4 dias",
    category: "Clínico-Torácico",
    difficulty: "1 - Fácil",
    main_question: "Qual o diagnóstico mais provável com base nos achados?",
    explanation: "As opacidades localizadas e sintomas agudos são típicos de pneumonia lobar.",
    answer_options: [
      "Pneumonia Lobar Direita",
      "Tuberculose Apical",
      "Derrame Pleural",
      "Doença Pulmonar Obstrutiva Crônica (DPOC)",
    ],
    correct_answer_index: 0,
  },
  {
    id: 2,
    title: "Fratura de Úmero",
    findings: "Linha radiolucente transversa no terço médio do úmero.",
    patient_clinical_info: "Homem, 22 anos, queda de bicicleta, dor e incapacidade de movimentar o braço.",
    patient_age: "22",
    patient_gender: "Masculino",
    symptoms_duration: "2 horas",
    category: "Trauma Osteoarticular",
    difficulty: "2 - Moderado",
    main_question: "O que o exame de imagem revela?",
    explanation: "A linha compatível com fratura indica necessidade de imobilização ortopédica.",
    answer_options: [
      "Fratura de Úmero",
      "Luxação Glenoumeral",
      "Osteomielite",
      "Tumor Ósseo Benigno",
    ],
    correct_answer_index: 0,
  },
  {
    id: 3,
    title: "Derrame Pleural",
    findings: "Velamento do seio costofrênico direito, linha de Damoiseau presente.",
    patient_clinical_info: "Homem, 54 anos, dispneia súbita após cirurgia abdominal.",
    patient_age: "54",
    patient_gender: "Masculino",
    symptoms_duration: "1 dia",
    category: "Clínico-Torácico",
    difficulty: "3 - Difícil",
    main_question: "Que alteração demonstra a radiografia?",
    explanation: "O derrame pleural é sugerido pelo velamento típico do seio costofrênico.",
    answer_options: [
      "Derrame Pleural",
      "Atelectasia",
      "Pneumotórax",
      "Pneumonia Intersticial",
    ],
    correct_answer_index: 0,
  },
  {
    id: 4,
    title: "Espondilolistese Lombar",
    findings: "Desalinhamento das vértebras L4-L5, deslizamento anterior.",
    patient_clinical_info: "Homem, 59 anos, dor lombar crônica progressiva.",
    patient_age: "59",
    patient_gender: "Masculino",
    symptoms_duration: "3 meses",
    category: "Coluna Vertebral",
    difficulty: "4 - Muito Difícil",
    main_question: "Qual o diagnóstico deste caso?",
    explanation: "Espondilolistese é caracterizada pelo deslizamento de corpos vertebrais.",
    answer_options: [
      "Espondilolistese Lombar",
      "Hérnia de Disco",
      "Fratura de Processos Articulares",
      "Osteoporose",
    ],
    correct_answer_index: 0,
  },
  {
    id: 5,
    title: "Artrose de Joelho",
    findings: "Redução do espaço articular medial com esclerose subcondral.",
    patient_clinical_info: "Mulher, 67 anos, dor ao caminhar e crepitação.",
    patient_age: "67",
    patient_gender: "Feminino",
    symptoms_duration: "1 ano",
    category: "Osteoarticular",
    difficulty: "2 - Moderado",
    main_question: "Que doença afeta principalmente este paciente?",
    explanation: "Os achados radiológicos e clínica sugerem artrose.",
    answer_options: [
      "Artrose de Joelho",
      "Artrite Reumatoide",
      "Fratura por Estresse",
      "Gota",
    ],
    correct_answer_index: 0,
  },
  {
    id: 6,
    title: "Meningioma",
    findings: "Massa extra-axial com base dural, captação homogênea ao contraste.",
    patient_clinical_info: "Mulher, 45 anos, cefaleia persistente.",
    patient_age: "45",
    patient_gender: "Feminino",
    symptoms_duration: "2 semanas",
    category: "Neuroimagem",
    difficulty: "3 - Difícil",
    main_question: "Com base na imagem, qual a hipótese diagnóstica?",
    explanation: "O padrão de base dural é clássico para meningioma.",
    answer_options: [
      "Meningioma",
      "Glioblastoma",
      "Metástase Cerebral",
      "Abscesso Cerebral",
    ],
    correct_answer_index: 0,
  },
  {
    id: 7,
    title: "Pneumotórax Espontâneo",
    findings: "Ausência de trama vascular pulmonar, descolamento da pleura.",
    patient_clinical_info: "Homem, 31 anos, surgimento súbito de dor torácica e dispneia.",
    patient_age: "31",
    patient_gender: "Masculino",
    symptoms_duration: "5 horas",
    category: "Clínico-Torácico",
    difficulty: "1 - Fácil",
    main_question: "O achado principal sugere qual condição?",
    explanation: "O colapso pulmonar sem trauma sugere pneumotórax espontâneo.",
    answer_options: [
      "Pneumotórax Espontâneo",
      "Embolia Pulmonar",
      "Pneumonia Alveolar",
      "Bronquiectasia",
    ],
    correct_answer_index: 0,
  },
  {
    id: 8,
    title: "Tumor de Pancoast",
    findings: "Massa apical pulmonar, invasão da parede torácica.",
    patient_clinical_info: "Homem, 62 anos, dor no ombro e perda de peso.",
    patient_age: "62",
    patient_gender: "Masculino",
    symptoms_duration: "3 meses",
    category: "Clínico-Torácico",
    difficulty: "4 - Muito Difícil",
    main_question: "O que os achados sugerem?",
    explanation: "Massa apical e sintomas neurológicos sugerem tumor de Pancoast.",
    answer_options: [
      "Tumor de Pancoast",
      "Pneumonia",
      "Metástase Pulmonar",
      "Abscesso Pulmonar",
    ],
    correct_answer_index: 0,
  },
  {
    id: 9,
    title: "Apendicite Aguda",
    findings: "Distensão do apêndice, borramento da gordura periapendicular.",
    patient_clinical_info: "Mulher, 19 anos, dor abdominal em fossa ilíaca direita.",
    patient_age: "19",
    patient_gender: "Feminino",
    symptoms_duration: "1 dia",
    category: "Abdome Agudo",
    difficulty: "2 - Moderado",
    main_question: "Qual o possível diagnóstico?",
    explanation: "Os achados são clássicos para apendicite aguda.",
    answer_options: [
      "Apendicite Aguda",
      "Diverticulite",
      "Colecistite",
      "Gastrite Aguda",
    ],
    correct_answer_index: 0,
  },
  {
    id: 10,
    title: "Osteomielite",
    findings: "Área radiolucente com rarefação óssea e periostite.",
    patient_clinical_info: "Homem, 12 anos, febre e dor progressiva na tíbia.",
    patient_age: "12",
    patient_gender: "Masculino",
    symptoms_duration: "6 dias",
    category: "Osteoarticular",
    difficulty: "3 - Difícil",
    main_question: "Com base no exame, qual a doença provável?",
    explanation: "O conjunto de sinais ósseos e sintomas sistêmicos indica osteomielite.",
    answer_options: [
      "Osteomielite",
      "Fratura Fisária",
      "Tumor Ósseo Maligno",
      "Artrite Séptica",
    ],
    correct_answer_index: 0,
  }
];

// Este componente mostra a visualização como se fosse para o usuário responder o caso
function CaseUserView({ caso, numero }: { caso: typeof fakeCases[0], numero: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  // Embaralhar alternativas cada vez que o caso for exibido
  const { shuffledAnswers, newCorrectIdx } = useMemo(
    () => shuffleAlternatives(caso.answer_options, caso.correct_answer_index),
    // eslint-disable-next-line
    [caso.id]
  );
  const isAnswered = selected !== null;
  return (
    <div className="border rounded-lg p-4 shadow bg-white mb-8">
      <div className="text-xs text-cyan-600 font-bold mb-1">Caso #{numero}</div>
      <div className="font-bold text-base mb-2">{caso.title}</div>
      <div className="mb-1">
        <span className="text-xs font-semibold">Categoria:</span> {caso.category}{" "}
        <span className="text-xs font-semibold">| Dificuldade:</span> {caso.difficulty}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Enunciado:</span> {caso.main_question}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Achados radiológicos:</span> {caso.findings}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Resumo clínico:</span> {caso.patient_clinical_info}
      </div>
      <div className="mb-2 flex gap-4">
        <span><span className="font-semibold">Idade:</span> {caso.patient_age}</span>
        <span><span className="font-semibold">Gênero:</span> {caso.patient_gender}</span>
        <span><span className="font-semibold">Duração sintomas:</span> {caso.symptoms_duration}</span>
      </div>
      <div className="mb-2 mt-2">
        <ol type="A" className="flex flex-col gap-2 pl-5">
          {shuffledAnswers.map((opt, idx) => (
            <li key={idx}>
              <button
                className={`text-left px-3 py-2 rounded border w-full
                  ${isAnswered
                    ? idx === selected
                      ? idx === newCorrectIdx
                        ? "bg-green-100 border-green-400 font-bold"
                        : "bg-red-50 border-red-400 text-red-600 font-bold"
                      : idx === newCorrectIdx
                        ? "bg-green-200 border-green-600 font-bold"
                        : "opacity-60"
                    : "hover:bg-cyan-50 border-cyan-300"}
                `}
                disabled={isAnswered}
                onClick={() => setSelected(idx)}
                tabIndex={0}
              >
                {String.fromCharCode(65 + idx)}) {opt}
              </button>
            </li>
          ))}
        </ol>
      </div>
      {isAnswered && (
        <div className="mt-3">
          {selected === newCorrectIdx ? (
            <span className="text-green-700 font-bold">✅ Resposta correta!</span>
          ) : (
            <span className="text-red-700">❌ Resposta incorreta.<br/>Correta: <b>{shuffledAnswers[newCorrectIdx]}</b></span>
          )}
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <b>Explicação:</b> {caso.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FakeCasesPreviewPage() {
  return (
    <div className="px-4 max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-cyan-900">Visualização: Quiz de Casos Radiológicos (Mock)</h1>
      {fakeCases.map((caso, idx) => (
        <CaseUserView key={caso.id} caso={caso} numero={idx + 1} />
      ))}
      <div className="text-sm text-gray-400 mt-12">
        * Casos simulados apenas para visualização/admin. Alternativas são embaralhadas a cada acesso.
      </div>
    </div>
  );
}
