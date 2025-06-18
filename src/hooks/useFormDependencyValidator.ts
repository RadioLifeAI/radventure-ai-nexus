
import { useEffect, useState } from "react";
import { useDataIdMappings } from "./useDataIdMappings";

export interface DependencyValidation {
  field: string;
  isValid: boolean;
  message: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface FormDependencyValidator {
  validations: DependencyValidation[];
  isFormValid: boolean;
  getFieldValidation: (field: string) => DependencyValidation | null;
  validateField: (field: string, value: any, formData: any) => DependencyValidation | null;
}

export function useFormDependencyValidator(formData: any): FormDependencyValidator {
  const [validations, setValidations] = useState<DependencyValidation[]>([]);
  const mappings = useDataIdMappings();

  const validateModalitySubtypePair = (modalityId: number, subtypeId: number): DependencyValidation | null => {
    if (!mappings.isValidModalitySubtypePair(modalityId, subtypeId)) {
      return {
        field: 'subtype',
        isValid: false,
        message: 'Subtipo incompatível com a modalidade selecionada',
        suggestion: 'Selecione um subtipo válido para esta modalidade',
        severity: 'error'
      };
    }
    return null;
  };

  const validateDifficultyPoints = (difficulty: number, points: number): DependencyValidation | null => {
    const expectedPoints = difficulty * 5; // 5 pontos por nível de dificuldade
    const variance = Math.abs(points - expectedPoints);
    
    if (variance > 5) {
      return {
        field: 'points',
        isValid: false,
        message: `Pontos não condizem com a dificuldade (esperado: ~${expectedPoints})`,
        suggestion: `Sugerimos ${expectedPoints} pontos para dificuldade ${difficulty}`,
        severity: 'warning'
      };
    }
    return null;
  };

  const validateSpecialtyDiagnosis = (categoryId: number, diagnosis: string): DependencyValidation | null => {
    const specialtyName = mappings.specialtyIdToName(categoryId);
    
    // Validações específicas por especialidade
    if (specialtyName?.toLowerCase().includes('neurologia') && 
        diagnosis && !diagnosis.toLowerCase().includes('neuro') && 
        !diagnosis.toLowerCase().includes('cerebral') &&
        !diagnosis.toLowerCase().includes('cranio')) {
      return {
        field: 'primary_diagnosis',
        isValid: false,
        message: 'Diagnóstico pode não ser compatível com Neurologia',
        suggestion: 'Verifique se o diagnóstico está correto para esta especialidade',
        severity: 'warning'
      };
    }

    if (specialtyName?.toLowerCase().includes('cardiologia') && 
        diagnosis && !diagnosis.toLowerCase().includes('cardio') && 
        !diagnosis.toLowerCase().includes('coração') &&
        !diagnosis.toLowerCase().includes('miocardio')) {
      return {
        field: 'primary_diagnosis',
        isValid: false,
        message: 'Diagnóstico pode não ser compatível com Cardiologia',
        suggestion: 'Verifique se o diagnóstico está correto para esta especialidade',
        severity: 'warning'
      };
    }
    
    return null;
  };

  const validateImageModalityConsistency = (modality: string, anatomicalRegions: string[]): DependencyValidation | null => {
    if (modality?.toLowerCase().includes('rx') || modality?.toLowerCase().includes('radiografia')) {
      if (anatomicalRegions.some(region => region.toLowerCase().includes('cerebro') || region.toLowerCase().includes('encefalo'))) {
        return {
          field: 'anatomical_regions',
          isValid: false,
          message: 'RX não é adequado para avaliação cerebral',
          suggestion: 'Use TC ou RM para avaliação do sistema nervoso central',
          severity: 'error'
        };
      }
    }
    return null;
  };

  const validateField = (field: string, value: any, formData: any): DependencyValidation | null => {
    switch (field) {
      case 'subtype':
        if (formData.modality && value) {
          const modalityId = mappings.modalityNameToId(formData.modality);
          const subtypeId = mappings.subtypeNameToId(value, formData.modality);
          if (modalityId && subtypeId) {
            return validateModalitySubtypePair(modalityId, subtypeId);
          }
        }
        break;
        
      case 'points':
        if (formData.difficulty_level && value) {
          return validateDifficultyPoints(formData.difficulty_level, value);
        }
        break;
        
      case 'primary_diagnosis':
        if (formData.category_id && value) {
          return validateSpecialtyDiagnosis(formData.category_id, value);
        }
        break;
        
      case 'anatomical_regions':
        if (formData.modality && value) {
          return validateImageModalityConsistency(formData.modality, Array.isArray(value) ? value : [value]);
        }
        break;
    }
    return null;
  };

  const getFieldValidation = (field: string): DependencyValidation | null => {
    return validations.find(v => v.field === field) || null;
  };

  // Executar validações quando os dados do formulário mudarem
  useEffect(() => {
    if (!formData || mappings.isLoading) return;

    const newValidations: DependencyValidation[] = [];

    // Validar todos os campos relevantes
    const fieldsToValidate = ['subtype', 'points', 'primary_diagnosis', 'anatomical_regions'];
    
    fieldsToValidate.forEach(field => {
      const validation = validateField(field, formData[field], formData);
      if (validation) {
        newValidations.push(validation);
      }
    });

    setValidations(newValidations);
  }, [formData, mappings.isLoading]);

  const isFormValid = validations.every(v => v.severity !== 'error');

  return {
    validations,
    isFormValid,
    getFieldValidation,
    validateField
  };
}
