
import { supabase } from '@/integrations/supabase/client';

export const createDefaultPrompts = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Usuário não autenticado');

  const defaultPrompts = [
    {
      name: 'Cardiologia Básica',
      category: 'Cardiologia',
      difficulty: 'Iniciante',
      modality: 'Radiografia',
      prompt_template: 'Crie uma pergunta verdadeiro/falso sobre {category} com dificuldade {difficulty} usando {modality}. A pergunta deve ser educativa e clara.',
      created_by: user.user.id,
      is_active: true
    },
    {
      name: 'Neurologia Avançada',
      category: 'Neurologia',
      difficulty: 'Avançado',
      modality: 'Ressonância Magnética',
      prompt_template: 'Elabore uma questão verdadeiro/falso sobre {category} de nível {difficulty} baseada em {modality}. Inclua detalhes técnicos importantes.',
      created_by: user.user.id,
      is_active: true
    },
    {
      name: 'Pneumologia Intermediária',
      category: 'Pneumologia',
      difficulty: 'Intermediário',
      modality: 'Tomografia Computadorizada',
      prompt_template: 'Formule uma pergunta verdadeiro/falso sobre {category} com dificuldade {difficulty} usando {modality}. Foque em aspectos diagnósticos práticos.',
      created_by: user.user.id,
      is_active: true
    }
  ];

  const { data, error } = await supabase
    .from('quiz_prompt_controls')
    .upsert(defaultPrompts, { onConflict: 'name' })
    .select();

  if (error) throw error;
  return data;
};
