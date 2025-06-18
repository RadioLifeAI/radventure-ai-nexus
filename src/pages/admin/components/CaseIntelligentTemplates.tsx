
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Heart,
  Bone,
  Eye,
  Stethoscope,
  Loader2,
  ChevronRight,
  Star,
  TrendingUp
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDataIdMappings } from "@/hooks/useDataIdMappings";

type Props = {
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onFieldsUpdated?: (fields: string[]) => void;
};

interface IntelligentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  color: string;
  specialty: string;
  modality: string;
  complexity: 'básico' | 'intermediário' | 'avançado';
  estimatedTime: string;
  fields: Record<string, any>;
}

export function CaseIntelligentTemplates({ form, setForm, onFieldsUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [lastTemplate, setLastTemplate] = useState<string | null>(null);
  const mappings = useDataIdMappings();

  // Templates inteligentes baseados em casos reais
  const intelligentTemplates: IntelligentTemplate[] = [
    {
      id: 'trauma_tc_emergencia',
      name: 'TC Trauma Emergencial',
      description: 'Caso de trauma cranioencefálico com TC de emergência',
      icon: <Brain className="h-5 w-5" />,
      badge: 'Emergência',
      color: 'bg-red-500',
      specialty: 'Neurologia',
      modality: 'Tomografia Computadorizada (TC)',
      complexity: 'avançado',
      estimatedTime: '3-5 min',
      fields: {
        category_id: 'neurologia',
        difficulty_level: 4,
        points: 20,
        modality: 'Tomografia Computadorizada (TC)',
        subtype: 'TC Crânio',
        case_classification: 'emergencial',
        exam_context: 'urgencia',
        target_audience: ['Residência R2', 'Residência R3'],
        case_complexity_factors: ['Trauma grave', 'Urgência médica', 'Múltiplas lesões'],
        learning_objectives: ['Identificar hemorragias intracranianas', 'Avaliar efeito de massa', 'Decidir conduta urgente'],
        anatomical_regions: ['Crânio', 'Encéfalo'],
        finding_types: ['Hemorragia', 'Edema', 'Fratura'],
        pathology_types: ['Trauma cranioencefálico'],
        main_symptoms: ['Perda de consciência', 'Cefaleia intensa', 'Vômitos'],
        case_rarity: 'comum',
        educational_value: 9,
        clinical_relevance: 10,
        estimated_solve_time: 8
      }
    },
    {
      id: 'pneumonia_rx_basico',
      name: 'RX Tórax - Pneumonia',
      description: 'Pneumonia comunitária típica em adulto jovem',
      icon: <Stethoscope className="h-5 w-5" />,
      badge: 'Comum',
      color: 'bg-blue-500',
      specialty: 'Pneumologia',
      modality: 'Radiografia (RX)',
      complexity: 'básico',
      estimatedTime: '2-3 min',
      fields: {
        category_id: 'pneumologia',
        difficulty_level: 2,
        points: 10,
        modality: 'Radiografia (RX)',
        subtype: 'RX Tórax PA',
        case_classification: 'diagnostico',
        exam_context: 'ambulatorio',
        target_audience: ['Graduação', 'Residência R1'],
        case_complexity_factors: ['Padrão típico', 'Caso comum'],
        learning_objectives: ['Identificar consolidação pulmonar', 'Diferenciar tipos de pneumonia', 'Avaliar extensão'],
        anatomical_regions: ['Pulmões', 'Tórax'],
        finding_types: ['Consolidação', 'Infiltrado'],
        pathology_types: ['Infecção pulmonar'],
        main_symptoms: ['Tosse', 'Febre', 'Dispneia'],
        case_rarity: 'comum',
        educational_value: 8,
        clinical_relevance: 9,
        estimated_solve_time: 5
      }
    },
    {
      id: 'fratura_rx_ortopedia',
      name: 'RX Fratura Ortopédica',
      description: 'Fratura de osso longo com deslocamento',
      icon: <Bone className="h-5 w-5" />,
      badge: 'Ortopedia',
      color: 'bg-green-500',
      specialty: 'Ortopedia',
      modality: 'Radiografia (RX)',
      complexity: 'intermediário',
      estimatedTime: '3-4 min',
      fields: {
        category_id: 'ortopedia',
        difficulty_level: 3,
        points: 15,
        modality: 'Radiografia (RX)',
        subtype: 'RX Membros',
        case_classification: 'diagnostico',
        exam_context: 'urgencia',
        target_audience: ['Residência R1', 'Residência R2'],
        case_complexity_factors: ['Fratura complexa', 'Avaliação de deslocamento'],
        learning_objectives: ['Identificar linha de fratura', 'Avaliar deslocamento', 'Classificar tipo de fratura'],
        anatomical_regions: ['Ossos longos', 'Articulações'],
        finding_types: ['Fratura', 'Deslocamento'],
        pathology_types: ['Trauma ósseo'],
        main_symptoms: ['Dor', 'Impotência funcional', 'Deformidade'],
        case_rarity: 'comum',
        educational_value: 8,
        clinical_relevance: 9,
        estimated_solve_time: 6
      }
    },
    {
      id: 'rm_neuro_avancado',
      name: 'RM Neurológica Avançada',
      description: 'Lesão do sistema nervoso central complexa',
      icon: <Brain className="h-5 w-5" />,
      badge: 'Avançado',
      color: 'bg-purple-500',
      specialty: 'Neurologia',
      modality: 'Ressonância Magnética (RM)',
      complexity: 'avançado',
      estimatedTime: '5-8 min',
      fields: {
        category_id: 'neurologia',
        difficulty_level: 4,
        points: 25,
        modality: 'Ressonância Magnética (RM)',
        subtype: 'RM Encéfalo',
        case_classification: 'diagnostico',
        exam_context: 'ambulatorio',
        target_audience: ['Residência R3', 'Fellow'],
        case_complexity_factors: ['Múltiplas sequências', 'Lesão complexa', 'Diagnóstico diferencial amplo'],
        learning_objectives: ['Interpretar múltiplas sequências', 'Diferenciar lesões', 'Correlação clínico-radiológica'],
        anatomical_regions: ['Encéfalo', 'Sistema nervoso central'],
        finding_types: ['Lesão expansiva', 'Alteração de sinal'],
        pathology_types: ['Neoplasia', 'Doença desmielinizante'],
        main_symptoms: ['Déficit neurológico', 'Cefaleia', 'Convulsões'],
        case_rarity: 'raro',
        educational_value: 10,
        clinical_relevance: 10,
        estimated_solve_time: 12
      }
    },
    {
      id: 'cardio_tc_angio',
      name: 'Angiotomografia Cardíaca',
      description: 'Avaliação de artérias coronárias por angiotomografia',
      icon: <Heart className="h-5 w-5" />,
      badge: 'Cardio',
      color: 'bg-red-500',
      specialty: 'Cardiologia',
      modality: 'Tomografia Computadorizada (TC)',
      complexity: 'avançado',
      estimatedTime: '4-6 min',
      fields: {
        category_id: 'cardiologia',
        difficulty_level: 4,
        points: 20,
        modality: 'Tomografia Computadorizada (TC)',
        subtype: 'Angiotomografia',
        case_classification: 'diagnostico',
        exam_context: 'ambulatorio',
        target_audience: ['Residência R2', 'Residência R3'],
        case_complexity_factors: ['Técnica avançada', 'Reconstrução 3D', 'Análise quantitativa'],
        learning_objectives: ['Avaliar artérias coronárias', 'Quantificar estenoses', 'Analisar placas'],
        anatomical_regions: ['Coração', 'Artérias coronárias'],
        finding_types: ['Estenose', 'Placa aterosclerótica'],
        pathology_types: ['Doença arterial coronariana'],
        main_symptoms: ['Dor precordial', 'Dispneia aos esforços', 'Palpitações'],
        case_rarity: 'comum',
        educational_value: 9,
        clinical_relevance: 10,
        estimated_solve_time: 10
      }
    },
    {
      id: 'caso_raro_especializado',
      name: 'Caso Raro Especializado',
      description: 'Patologia rara com apresentação atípica',
      icon: <Star className="h-5 w-5" />,
      badge: 'Raro',
      color: 'bg-yellow-500',
      specialty: 'Radiologia',
      modality: 'Múltiplas modalidades',
      complexity: 'avançado',
      estimatedTime: '8-12 min',
      fields: {
        category_id: 'radiologia',
        difficulty_level: 5,
        points: 30,
        case_classification: 'diagnostico',
        exam_context: 'ambulatorio',
        target_audience: ['Fellow', 'Especialista'],
        case_complexity_factors: ['Patologia rara', 'Apresentação atípica', 'Diagnóstico desafiador'],
        learning_objectives: ['Reconhecer padrões raros', 'Aplicar diagnóstico diferencial', 'Correlação multimodal'],
        case_rarity: 'muito_raro',
        educational_value: 10,
        clinical_relevance: 8,
        estimated_solve_time: 15
      }
    }
  ];

  const convertAndApplyTemplate = async (template: IntelligentTemplate) => {
    setLoading(true);
    setLastTemplate(template.id);

    try {
      // Converter dados do template para IDs do banco quando necessário
      const convertedFields: any = { ...template.fields };

      // Converter category_id de nome para ID
      if (template.fields.category_id && typeof template.fields.category_id === 'string') {
        const categoryId = mappings.specialtyNameToId(template.fields.category_id);
        if (categoryId) {
          convertedFields.category_id = categoryId;
        }
      }

      // Aplicar campos do template mantendo dados já preenchidos
      setForm((prev: any) => ({
        ...prev,
        ...convertedFields,
        // Preservar campos importantes já preenchidos
        title: prev.title || convertedFields.title,
        findings: prev.findings || convertedFields.findings,
        patient_clinical_info: prev.patient_clinical_info || convertedFields.patient_clinical_info,
        main_question: prev.main_question || convertedFields.main_question,
        explanation: prev.explanation || convertedFields.explanation
      }));

      const appliedFields = Object.keys(convertedFields);
      onFieldsUpdated?.(appliedFields);

      toast({
        title: `Template "${template.name}" aplicado!`,
        description: `${appliedFields.length} campos atualizados com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      toast({
        title: "Erro ao aplicar template",
        description: "Não foi possível aplicar o template selecionado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLastTemplate(null);
    }
  };

  // Filtrar templates baseados no contexto atual do formulário
  const getRecommendedTemplates = () => {
    const formModality = form.modality?.toLowerCase() || '';
    const formSpecialty = mappings.specialtyIdToName(form.category_id)?.toLowerCase() || '';

    return intelligentTemplates.filter(template => {
      // Priorizar templates que correspondem à modalidade atual
      if (formModality && template.modality.toLowerCase().includes(formModality)) {
        return true;
      }
      
      // Priorizar templates que correspondem à especialidade atual
      if (formSpecialty && template.specialty.toLowerCase().includes(formSpecialty)) {
        return true;
      }

      // Incluir todos se não houver contexto específico
      return !formModality && !formSpecialty;
    }).sort((a, b) => {
      // Ordenar por relevância: modalidade > especialidade > complexidade
      const aModalityMatch = formModality && a.modality.toLowerCase().includes(formModality);
      const bModalityMatch = formModality && b.modality.toLowerCase().includes(formModality);
      
      if (aModalityMatch && !bModalityMatch) return -1;
      if (!aModalityMatch && bModalityMatch) return 1;
      
      return a.complexity === 'básico' ? -1 : 1; // Priorizar casos básicos
    });
  };

  const recommendedTemplates = getRecommendedTemplates();

  if (mappings.isLoading) {
    return (
      <Card className="border-purple-200">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando templates inteligentes...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Sparkles className="h-5 w-5" />
          Templates Inteligentes Aprimorados
          <Badge className="bg-purple-500 text-white">IA</Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            Baseado em Casos Reais
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-purple-700 mb-4">
          Templates especializados baseados em análise de casos reais do banco de dados.
          {form.modality && (
            <div className="mt-1 font-medium">
              🎯 Recomendados para: {form.modality}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendedTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-purple-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded ${template.color} text-white`}>
                    {template.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {template.specialty} • {template.modality}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`${template.color} text-white text-xs`}
                  variant="secondary"
                >
                  {template.badge}
                </Badge>
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>{template.complexity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  <span>{template.estimatedTime}</span>
                </div>
              </div>

              <Button
                onClick={() => convertAndApplyTemplate(template)}
                disabled={loading}
                className="w-full h-8 text-xs"
                variant="outline"
              >
                {loading && lastTemplate === template.id ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-3 w-3 mr-1" />
                    Aplicar Template
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {recommendedTemplates.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Nenhum template recomendado para o contexto atual.
            </p>
            <p className="text-xs">
              Preencha modalidade ou especialidade para ver sugestões personalizadas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
