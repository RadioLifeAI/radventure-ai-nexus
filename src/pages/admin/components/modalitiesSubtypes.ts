
export type ModalityOption = {
  value: string;
  label: string;
  subtypes: { value: string; label: string }[];
};

export const MODALIDADES_SUBTYPES: ModalityOption[] = [
  {
    value: "Tomografia Computadorizada (TC)",
    label: "Tomografia Computadorizada (TC)",
    subtypes: [
      { value: "Angio-TC de Crânio", label: "Angio-TC de Crânio" },
      { value: "TC Crânio", label: "TC Crânio" },
      { value: "TC Seios da Face", label: "TC Seios da Face" },
      { value: "TC Pescoço", label: "TC Pescoço" },
      // ... adicione outros subtipos relevantes
    ],
  },
  {
    value: "Ressonância Magnética (RM)",
    label: "Ressonância Magnética (RM)",
    subtypes: [
      { value: "RM Encéfalo", label: "RM Encéfalo" },
      { value: "Angio-RM de Crânio", label: "Angio-RM de Crânio" },
      // ... continue conforme necessário
    ],
  },
  // ... continue para outras modalidades
];
