
// Lista fixa (usada na criação de casos)
export const modalitiesSubtypes = [
  {
    value: "Radiografia (RX)",
    label: "Radiografia (RX)",
    subtypes: [
      { value: "RX Tórax", label: "RX Tórax" },
      { value: "RX Abdome", label: "RX Abdome" },
      { value: "RX Crânio", label: "RX Crânio" },
      { value: "RX Coluna", label: "RX Coluna" },
      { value: "RX Extremidades", label: "RX Extremidades" },
      { value: "RX Outros", label: "RX Outros" },
    ],
  },
  {
    value: "Tomografia Computadorizada (TC)",
    label: "Tomografia Computadorizada (TC)",
    subtypes: [
      { value: "TC Crânio", label: "TC Crânio" },
      { value: "TC Tórax", label: "TC Tórax" },
      { value: "TC Abdome", label: "TC Abdome" },
      { value: "TC Coluna", label: "TC Coluna" },
      { value: "TC Outros", label: "TC Outros" },
    ],
  },
  {
    value: "Ressonância Magnética (RM)",
    label: "Ressonância Magnética (RM)",
    subtypes: [
      { value: "RM Crânio", label: "RM Crânio" },
      { value: "RM Coluna", label: "RM Coluna" },
      { value: "RM Articulações", label: "RM Articulações" },
      { value: "RM Abdome", label: "RM Abdome" },
      { value: "RM Outros", label: "RM Outros" },
    ],
  },
  {
    value: "Ultrassonografia (USG)",
    label: "Ultrassonografia (USG)",
    subtypes: [
      { value: "USG Abdome", label: "USG Abdome" },
      { value: "USG Obstétrica", label: "USG Obstétrica" },
      { value: "USG Partes moles", label: "USG Partes moles" },
      { value: "USG Vascular", label: "USG Vascular" },
      { value: "USG Outros", label: "USG Outros" },
    ],
  },
  {
    value: "Mamografia",
    label: "Mamografia",
    subtypes: [
      { value: "Mamografia Convencional", label: "Mamografia Convencional" },
      { value: "Mamografia Digital", label: "Mamografia Digital" },
      { value: "Mamografia Outros", label: "Mamografia Outros" },
    ]
  },
  {
    value: "Outros",
    label: "Outros",
    subtypes: [
      { value: "Densitometria Óssea", label: "Densitometria Óssea" },
      { value: "PET-CT", label: "PET-CT" },
      { value: "Cintilografia", label: "Cintilografia" },
      { value: "Outro", label: "Outro" },
    ]
  }
];
