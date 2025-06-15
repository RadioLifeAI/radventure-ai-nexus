
import React from "react";

const MODALIDADADES: { value: string; label: string; subtypes: { value: string; label: string }[] }[] = [
  {
    value: "Tomografia Computadorizada (TC)",
    label: "Tomografia Computadorizada (TC)",
    subtypes: [
      { value: "Angio-TC de Crânio", label: "Angio-TC de Crânio" },
      { value: "Angio-TC de Pescoço e Carótidas", label: "Angio-TC de Pescoço e Carótidas" },
      { value: "Angio-TC de Tórax", label: "Angio-TC de Tórax (para TEP)" },
      { value: "Angio-TC de Aorta", label: "Angio-TC de Aorta (Torácica e Abdominal)" },
      { value: "Angio-TC de Artérias Coronárias", label: "Angio-TC de Artérias Coronárias (Angio-Coro)" },
      { value: "Angio-TC de Vasos Abdominais", label: "Angio-TC de Vasos Abdominais" },
      { value: "Angio-TC de Membros Inferiores/Superiores", label: "Angio-TC de MMII/MMSS" },
      { value: "TC Crânio", label: "TC Crânio" },
      { value: "TC Seios da Face", label: "TC Seios da Face" },
      { value: "TC Pescoço", label: "TC Pescoço" },
      { value: "TC Tórax", label: "TC Tórax (Alta Resolução/Contraste)" },
      { value: "TC Abdome Total", label: "TC Abdome Total" },
      { value: "TC Pelve", label: "TC Pelve" },
      { value: "Uro-TC", label: "Uro-TC (vias urinárias)" },
      { value: "Entero-TC", label: "Entero-TC (intestino delgado)" },
      { value: "TC Coluna", label: "TC Coluna (Cervical/Torácica/Lombar)" },
      { value: "TC Musculoesquelético", label: "TC Musculoesquelético" },
    ],
  },
  {
    value: "Ressonância Magnética (RM)",
    label: "Ressonância Magnética (RM)",
    subtypes: [
      { value: "RM Encéfalo", label: "RM Encéfalo" },
      { value: "Angio-RM de Crânio", label: "Angio-RM de Crânio (Arterial e Venosa)" },
      { value: "RM Sela Túrcica / Hipófise", label: "RM Sela Túrcica / Hipófise" },
      { value: "RM Órbitas", label: "RM Órbitas" },
      { value: "RM Pescoço", label: "RM Pescoço" },
      { value: "RM Tórax", label: "RM Tórax (Mediastino)" },
      { value: "RM Mama", label: "RM Mama (com/sem contraste)" },
      { value: "RM Cardíaca", label: "RM Cardíaca" },
      { value: "RM Abdome Superior", label: "RM Abdome Superior" },
      { value: "Colangio-RM", label: "Colangio-RM (Vias Biliares)" },
      { value: "Entero-RM", label: "Entero-RM (Intestino Delgado)" },
      { value: "RM Pelve", label: "RM Pelve" },
      { value: "RM Coluna", label: "RM Coluna (Cervical/Torácica/Lombar)" },
      { value: "RM ATM", label: "RM Articulação Temporomandibular (ATM)" },
      { value: "RM Musculoesquelético", label: "RM Musculoesquelético" },
      { value: "Artro-RM", label: "Artro-RM" },
    ],
  },
  {
    value: "Ultrassonografia (US)",
    label: "Ultrassonografia (US)",
    subtypes: [
      { value: "US Abdominal Total", label: "US Abdominal Total" },
      { value: "US Abdome Superior", label: "US Abdome Superior" },
      { value: "US Rins e Vias Urinárias", label: "US Rins/Vias Urinárias" },
      { value: "US Pélvico (Suprapúbico)", label: "US Pélvico (Suprapúbico)" },
      { value: "US Pélvico Transvaginal", label: "US Pélvico Transvaginal" },
      { value: "US Próstata", label: "US Próstata" },
      { value: "US Obstétrico", label: "US Obstétrico" },
      { value: "US Mama e Axilas", label: "US Mama/Axilas" },
      { value: "US Tireoide e Cervical", label: "US Tireoide/Cervical" },
      { value: "US Glândulas Salivares", label: "US Glândulas Salivares" },
      { value: "US Musculoesquelético", label: "US Musculoesquelético" },
      { value: "US Partes Moles", label: "US Partes Moles" },
      { value: "US Doppler Vascular", label: "US Doppler Vascular" },
      { value: "Ecocardiograma Transtorácico", label: "Ecocardiograma Transtorácico" },
    ],
  },
  {
    value: "Radiografia (RX)",
    label: "Radiografia (RX)",
    subtypes: [
      { value: "RX Tórax", label: "RX Tórax" },
      { value: "RX Abdome Simples e Agudo", label: "RX Abdome Simples/Agudo" },
      { value: "RX Coluna", label: "RX Coluna" },
      { value: "RX Crânio e Face", label: "RX Crânio/Face" },
      { value: "RX de Extremidades", label: "RX Extremidades" },
      { value: "RX Pelve e Bacia", label: "RX Pelve/Bacia" },
      { value: "RX Escanometria", label: "RX Escanometria" },
      { value: "RX Panorâmica de Mandíbula", label: "RX Panorâmica de Mandíbula" }
    ]
  },
  {
    value: "Mamografia (MMG)",
    label: "Mamografia (MMG)",
    subtypes: [
      { value: "Mamografia Digital Bilateral", label: "Mamografia Digital Bilateral" },
      { value: "Mamografia Diagnóstica", label: "Mamografia Diagnóstica" },
      { value: "Tomossíntese Mamária", label: "Tomossíntese Mamária" },
      { value: "Mamografia com Contraste", label: "Mamografia com Contraste" }
    ]
  },
  {
    value: "Medicina Nuclear (MN)",
    label: "Medicina Nuclear (MN)",
    subtypes: [
      { value: "Cintilografia Óssea", label: "Cintilografia Óssea" },
      { value: "Cintilografia Miocárdica", label: "Cintilografia Miocárdica" },
      { value: "Cintilografia Renal", label: "Cintilografia Renal" },
      { value: "Cintilografia de Tireoide", label: "Cintilografia de Tireoide" },
      { value: "PET-CT Oncológico", label: "PET-CT Oncológico" },
      { value: "PET-CT com PSMA", label: "PET-CT com PSMA" },
      { value: "PET-CT com FDG", label: "PET-CT com FDG" }
    ],
  },
  {
    value: "Radiologia Intervencionista (RI)",
    label: "Radiologia Intervencionista (RI)",
    subtypes: [
      { value: "Angioplastia e Stent", label: "Angioplastia e Stent" },
      { value: "Biópsia Guiada", label: "Biópsia Guiada por TC/US" },
      { value: "Drenagem de Abscessos", label: "Drenagem de Abscessos" },
      { value: "Quimioembolização Hepática", label: "Quimioembolização Hepática" },
      { value: "Ablação por Radiofrequência", label: "Ablação por Radiofrequência" },
      { value: "Vertebroplastia", label: "Vertebroplastia" }
    ]
  },
  {
    value: "Fluoroscopia",
    label: "Fluoroscopia",
    subtypes: [
      { value: "Estudo Contrastado do Esôfago, Estômago e Duodeno (EED)", label: "EED" },
      { value: "Trânsito Intestinal", label: "Trânsito Intestinal" },
      { value: "Enema Opaco", label: "Enema Opaco" },
      { value: "Histerossalpingografia (HSG)", label: "HSG" },
      { value: "Uretrocistografia Miccional", label: "Uretrocistografia Miccional" }
    ]
  },
  {
    value: "Densitometria Óssea (DMO)",
    label: "Densitometria Óssea (DMO)",
    subtypes: [
      { value: "Densitometria de Coluna e Fêmur", label: "Densitometria Coluna/Fêmur" },
      { value: "Densitometria de Corpo Inteiro", label: "Densitometria Corpo Inteiro" }
    ]
  }
];

type Props = {
  value: { modality: string; subtype: string };
  onChange: (val: { modality: string; subtype: string }) => void;
};

export function CaseModalityFields({ value, onChange }: Props) {
  const currentModality = MODALIDADADES.find(m => m.value === value.modality);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="font-semibold block">Modalidade Principal *</label>
        <select
          className="w-full border rounded px-2 py-2"
          value={value.modality}
          onChange={e => onChange({ modality: e.target.value, subtype: "" })}
          required
        >
          <option value="">Selecione a modalidade</option>
          {MODALIDADADES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-semibold block">Subtipo *</label>
        <select
          className="w-full border rounded px-2 py-2"
          value={value.subtype}
          onChange={e => onChange({ modality: value.modality, subtype: e.target.value })}
          required={!!value.modality}
          disabled={!value.modality}
        >
          <option value="">Selecione o subtipo</option>
          {currentModality?.subtypes.map(sub => (
            <option key={sub.value} value={sub.value}>
              {sub.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
