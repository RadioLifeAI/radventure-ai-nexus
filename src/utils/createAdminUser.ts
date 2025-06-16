
import { supabase } from '@/integrations/supabase/client';

export async function createAdminUser() {
  try {
    console.log('Creating temporary admin user...');
    
    // Primeiro, criar o usuário usando o signUp
    const { data, error } = await supabase.auth.signUp({
      email: 'admin.temp@radventure.com',
      password: 'RadVenture2024!Admin',
      options: {
        data: {
          full_name: 'Admin Temporário',
          academic_stage: 'Specialist'
        }
      }
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return { error };
    }

    if (data.user) {
      console.log('Admin user created successfully:', data.user.id);
      
      // Aguardar um pouco para o trigger criar o perfil
      setTimeout(async () => {
        try {
          // Atualizar o tipo de perfil para ADMIN
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ type: 'ADMIN' })
            .eq('id', data.user!.id);

          if (updateError) {
            console.error('Error updating profile type:', updateError);
          }

          // Adicionar role DEV
          const { error: roleError } = await supabase
            .from('admin_user_roles')
            .insert({
              user_id: data.user!.id,
              admin_role: 'DEV',
              assigned_by: data.user!.id,
              is_active: true
            });

          if (roleError) {
            console.error('Error adding admin role:', roleError);
          } else {
            console.log('Admin role added successfully');
          }
        } catch (err) {
          console.error('Error in post-creation setup:', err);
        }
      }, 2000);
    }

    return { error: null };
  } catch (err) {
    console.error('Unexpected error creating admin user:', err);
    return { error: err };
  }
}
