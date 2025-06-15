
import { useCallback } from "react";

export function useCaseTitleGenerator(categories: { id: number; name: string }[]) {
  function abbreviateCategory(catName: string) {
    if (!catName) return "";
    if (catName.toLowerCase().includes("neuro")) return "Neuro";
    if (catName.toLowerCase().includes("cardio")) return "Cardio";
    if (catName.toLowerCase().includes("derma")) return "Derma";
    return catName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5);
  }
  function generateRandomCaseNumber() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  const generateTitle = useCallback(
    (categoryId: string, modality: string) => {
      const categoria = categories.find(c => String(c.id) === String(categoryId))?.name || "";
      const abrev = abbreviateCategory(categoria);
      const rndNumber = generateRandomCaseNumber();
      return { title: `Caso ${abrev} ${rndNumber}`, case_number: rndNumber, abrev };
    },
    [categories]
  );
  return { generateTitle, abbreviateCategory, generateRandomCaseNumber };
}
