
import { useState } from "react";
import { useCaseProfileFormState } from "./useCaseProfileFormState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useCaseProfileFormUtils } from "./useCaseProfileFormUtils";

export function useCaseProfileFormHandlers({ categories, difficulties }: { categories: any[], difficulties: any[] }) {
  const { form, setForm, resetForm } = useCaseProfileFormState();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const utils = useCaseProfileFormUtils({ categories, difficulties, toast, setForm, setHighlightedFields });

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target as any;
    if (name === "difficulty_level") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        points: utils.suggestPointsByDifficulty(value),
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleModalityChange(val: { modality: string; subtype: string }) {
    setForm((prev) => ({ ...prev, modality: val.modality, subtype: val.subtype }));
  }
  function handleOptionChange(idx: number, val: string) {
    setForm((prev) => {
      const opts = [...prev.answer_options];
      opts[idx] = val;
      return { ...prev, answer_options: opts };
    });
  }
  function handleOptionFeedbackChange(idx: number, val: string) {
    setForm((prev) => {
      const arr = [...prev.answer_feedbacks];
      arr[idx] = val;
      return { ...prev, answer_feedbacks: arr };
    });
  }
  function handleShortTipChange(idx: number, val: string) {
    setForm((prev) => {
      const arr = [...prev.answer_short_tips];
      arr[idx] = val;
      return { ...prev, answer_short_tips: arr };
    });
  }
  function handleCorrectChange(idx: number) {
    setForm((prev) => ({ ...prev, correct_answer_index: idx }));
  }
  function handleImageChange(url: string | null) {
    setForm((prev) => ({ ...prev, image_url: url || "" }));
  }

  // Sugestões IA e automações vêm do utils
  const { handleAutoFillCaseDetails, handleSuggestTitle, handleSuggestAlternatives, handleSuggestHint, handleSuggestExplanation, handleGenerateAutoTitle } = utils;

  return {
    form, setForm, resetForm, submitting, setSubmitting, feedback, setFeedback,
    showAdvanced, setShowAdvanced, showPreview, setShowPreview, highlightedFields, setHighlightedFields,
    handleFormChange, handleModalityChange, handleOptionChange, handleOptionFeedbackChange,
    handleShortTipChange, handleCorrectChange, handleImageChange,
    handleAutoFillCaseDetails, handleSuggestTitle, handleSuggestAlternatives, handleSuggestHint, handleSuggestExplanation, handleGenerateAutoTitle
  };
}
