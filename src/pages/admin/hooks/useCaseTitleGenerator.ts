
import { useCallback } from "react";

export function useCaseTitleGenerator(categories: { id: number; name: string }[]) {
  function abbreviateCategory(catName: string) {
    if (!catName) return "";
    if (catName.toLowerCase().includes("neuro")) return "Neuro";
    if (catName.toLowerCase().includes("cardio")) return "Cardio";
    if (catName.toLowerCase().includes("derma")) return "Derma";
    if (catName.toLowerCase().includes("pneumo")) return "Pneumo";
    if (catName.toLowerCase().includes("ortop")) return "Ortop";
    if (catName.toLowerCase().includes("gastro")) return "Gastro";
    if (catName.toLowerCase().includes("uro")) return "Uro";
    if (catName.toLowerCase().includes("oftalmo")) return "Oftalmo";
    if (catName.toLowerCase().includes("gineco")) return "Gineco";
    if (catName.toLowerCase().includes("pediatr")) return "Pediatr";
    return catName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6);
  }

  function abbreviateModality(modality: string) {
    if (!modality) return "";
    if (modality.toLowerCase().includes("tomografia")) return "TC";
    if (modality.toLowerCase().includes("ressonância")) return "RM";
    if (modality.toLowerCase().includes("ultrassom")) return "USG";
    if (modality.toLowerCase().includes("radiografia")) return "RX";
    if (modality.toLowerCase().includes("mamografia")) return "MAMO";
    if (modality.toLowerCase().includes("densitometria")) return "DEXA";
    if (modality.toLowerCase().includes("cintilografia")) return "CINT";
    if (modality.toLowerCase().includes("angiografia")) return "ANGIO";
    return modality.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4);
  }

  function getDifficultyName(level: number) {
    switch (level) {
      case 1: return "basico";
      case 2: return "intermediario";
      case 3: return "avancado";
      case 4: return "expert";
      default: return "intermediario";
    }
  }

  function generateRandomCaseNumber() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  const generateTitle = useCallback(
    (categoryId: string | number, modality: string, difficultyLevel: number) => {
      const categoria = categories.find(c => String(c.id) === String(categoryId))?.name || "";
      const abrevCat = abbreviateCategory(categoria);
      const abrevMod = abbreviateModality(modality);
      const difficulty = getDifficultyName(difficultyLevel);
      const rndNumber = generateRandomCaseNumber();
      
      const title = `Caso ${abrevCat} ${difficulty} ${abrevMod} #${rndNumber}`;
      
      return { 
        title, 
        case_number: rndNumber, 
        abrev: abrevCat,
        modality_abbrev: abrevMod,
        difficulty_name: difficulty
      };
    },
    [categories]
  );

  return { generateTitle, abbreviateCategory, abbreviateModality, getDifficultyName, generateRandomCaseNumber };
}
