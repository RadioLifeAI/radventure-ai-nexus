
import { supabase } from '@/integrations/supabase/client';

export async function setupInitialAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }

    console.log('Setting up initial admin for user:', user.id);

    // Verificar se o usuário já tem roles
    const { data: existingRoles } = await supabase
      .from('admin_user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (existingRoles && existingRoles.length > 0) {
      console.log('User already has admin roles:', existingRoles);
      return true;
    }

    // Adicionar role DEV para o usuário atual
    const { error } = await supabase
      .from('admin_user_roles')
      .insert({
        user_id: user.id,
        admin_role: 'DEV',
        assigned_by: user.id,
        is_active: true
      });

    if (error) {
      console.error('Error setting up initial admin:', error);
      return false;
    }

    console.log('Initial admin setup successful');
    return true;
  } catch (error) {
    console.error('Unexpected error in admin setup:', error);
    return false;
  }
}

export async function checkAndSetupAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  // Verificar se já existem admins na base de dados
  const { data: existingAdmins } = await supabase
    .from('admin_user_roles')
    .select('*')
    .eq('is_active', true)
    .limit(1);

  // Se não existem admins, configurar o usuário atual como DEV
  if (!existingAdmins || existingAdmins.length === 0) {
    return await setupInitialAdmin();
  }

  return true;
}
