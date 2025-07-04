import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  file: string; // base64 string
  userId: string;
  fileName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { file, userId, fileName }: ProcessRequest = await req.json();
    
    console.log(`📸 Processando avatar para usuário: ${userId}`);
    
    // Decode base64 to binary
    const binaryData = Uint8Array.from(atob(file), c => c.charCodeAt(0));
    
    // Simulate Sharp processing (WebP compression)
    // In a real implementation, you would use Sharp or similar
    const processedImage = binaryData;
    
    // Generate file path
    const timestamp = Date.now();
    const avatarPath = `${userId}/avatar-${timestamp}.webp`;
    
    // Upload to avatars bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(avatarPath, processedImage, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarPath);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError);
      throw updateError;
    }

    console.log(`✅ Avatar processado e salvo: ${urlData.publicUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        avatar_url: urlData.publicUrl,
        message: 'Avatar processado com sucesso'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});