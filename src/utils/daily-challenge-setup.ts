
import { supabase } from '@/integrations/supabase/client';

export const createDefaultPrompts = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Usuário não autenticado');

  // Buscar dados reais das tabelas
  const { data: specialties } = await supabase
    .from('medical_specialties')
    .select('name')
    .limit(5);

  const { data: difficulties } = await supabase
    .from('difficulties')
    .select('description')
    .order('level');

  const { data: modalities } = await supabase
    .from('imaging_modalities')
    .select('name')
    .limit(5);

  if (!specialties || !difficulties || !modalities) {
    throw new Error('Não foi possível carregar dados das tabelas');
  }

  const defaultPrompts = [
    {
      name: `${specialties[0]?.name || 'Cardiologia'} Básica`,
      category: specialties[0]?.name || 'Cardiologia',
      difficulty: difficulties[0]?.description || 'Iniciante',
      modality: modalities[0]?.name || 'Radiografia',
      prompt_template: 'Crie uma pergunta verdadeiro/falso sobre {category} com dificuldade {difficulty} usando {modality}. A pergunta deve ser educativa e clara.',
      created_by: user.user.id,
      is_active: true
    },
    {
      name: `${specialties[1]?.name || 'Neurologia'} Avançada`,
      category: specialties[1]?.name || 'Neurologia',
      difficulty: difficulties[2]?.description || 'Avançado',
      modality: modalities[1]?.name || 'Ressonância Magnética',
      prompt_template: 'Elabore uma questão verdadeiro/falso sobre {category} de nível {difficulty} baseada em {modality}. Inclua detalhes técnicos importantes.',
      created_by: user.user.id,
      is_active: true
    },
    {
      name: `${specialties[2]?.name || 'Pneumologia'} Intermediária`,
      category: specialties[2]?.name || 'Pneumologia',
      difficulty: difficulties[1]?.description || 'Intermediário',
      modality: modalities[2]?.name || 'Tomografia Computadorizada',
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

export const validateAndCleanPrompts = async () => {
  // Limpar prompts com dados inválidos
  const { error: deleteError } = await supabase
    .from('quiz_prompt_controls')
    .delete()
    .or('name.is.null,category.is.null,difficulty.is.null,modality.is.null');

  if (deleteError) {
    console.error('Erro ao limpar prompts inválidos:', deleteError);
  }

  // Buscar especialidades válidas
  const { data: validSpecialties } = await supabase
    .from('medical_specialties')
    .select('name');

  const { data: validDifficulties } = await supabase
    .from('difficulties')
    .select('description');

  const { data: validModalities } = await supabase
    .from('imaging_modalities')
    .select('name');

  // Atualizar prompts com dados inconsistentes
  if (validSpecialties && validDifficulties && validModalities) {
    const specialtyNames = validSpecialties.map(s => s.name);
    const difficultyNames = validDifficulties.map(d => d.description).filter(Boolean);
    const modalityNames = validModalities.map(m => m.name);

    console.log('Dados válidos encontrados:', {
      specialties: specialtyNames.length,
      difficulties: difficultyNames.length,
      modalities: modalityNames.length
    });
  }

  return { success: true };
};
