import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  file: string; // base64 string
  eventId: string;
  fileName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let supabase;
  try {
    // Verificar configuração crítica
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceKey) {
      console.error('❌ CONFIGURAÇÃO CRÍTICA: URLs/Keys não configuradas');
      throw new Error('Configuração de servidor incompleta');
    }

    supabase = createClient(supabaseUrl, serviceKey);
    
    const requestBody = await req.json();
    const { file, eventId, fileName }: ProcessRequest = requestBody;
    
    // Validações iniciais extensas
    if (!file || !eventId || !fileName) {
      console.error('❌ DADOS INVÁLIDOS:', { 
        hasFile: !!file, 
        hasEventId: !!eventId, 
        hasFileName: !!fileName 
      });
      throw new Error('Dados obrigatórios ausentes');
    }
    
    console.log(`🖼️ Processando banner para evento: ${eventId}`);
    
    // DIAGNÓSTICO INICIAL - verificar infraestrutura
    const { data: debugInfo } = await supabase.rpc('debug_event_banner_upload', {
      p_event_id: eventId
    });
    
    console.log('🔍 DIAGNÓSTICO:', debugInfo);
    
    if (!debugInfo?.bucket_exists) {
      throw new Error('Bucket event-banners não existe');
    }
    
    if (!debugInfo?.event_exists) {
      throw new Error(`Evento ${eventId} não encontrado`);
    }
    
    // Decode base64 to binary com validação
    let binaryData;
    try {
      binaryData = Uint8Array.from(atob(file), c => c.charCodeAt(0));
      console.log(`📊 Arquivo decodificado: ${binaryData.length} bytes`);
    } catch (error) {
      console.error('❌ Erro ao decodificar base64:', error);
      throw new Error('Arquivo base64 inválido');
    }
    
    // Validate file size
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (binaryData.length > maxSize) {
      throw new Error(`Arquivo muito grande: ${binaryData.length} bytes (max: ${maxSize})`);
    }
    
    // Simulate processing for 3 sizes (WebP)
    // In real implementation, use Sharp for resizing
    const sizes = [
      { name: 'thumb', width: 400, quality: 80 },
      { name: 'medium', width: 800, quality: 85 },
      { name: 'full', width: 1600, quality: 90 }
    ];

    console.log(`🔄 Iniciando upload de ${sizes.length} tamanhos...`);
    
    const uploadPromises = sizes.map(async (size) => {
      try {
        // Simulate image processing (would be Sharp in real implementation)
        const processedImage = binaryData;
        
        const filePath = `${eventId}/${size.name}_${size.width}.webp`;
        
        console.log(`📤 Uploading ${size.name}: ${filePath}`);
        
        const { data, error } = await supabase.storage
          .from('event-banners')
          .upload(filePath, processedImage, {
            contentType: 'image/webp',
            upsert: true
          });

        if (error) {
          console.error(`❌ Erro upload ${size.name}:`, error);
          throw error;
        }
        
        console.log(`✅ Upload ${size.name} success:`, data);

        const { data: urlData } = supabase.storage
          .from('event-banners')
          .getPublicUrl(filePath);

        return {
          size: size.name,
          url: urlData.publicUrl,
          path: filePath
        };
      } catch (error) {
        console.error(`❌ Falha no upload ${size.name}:`, error);
        throw error;
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    console.log(`✅ Todos os uploads concluídos:`, uploadResults.length);
    
    // Organize URLs by size
    const urls = uploadResults.reduce((acc, result) => ({
      ...acc,
      [`${result.size}_url`]: result.url
    }), {});

    console.log('🔗 URLs geradas:', urls);

    // Save to event_banner_images table
    console.log('💾 Salvando metadados na tabela...');
    const { data: bannerData, error: insertError } = await supabase
      .from('event_banner_images')
      .insert({
        event_id: eventId,
        thumb_url: urls.thumb_url,
        medium_url: urls.medium_url,
        full_url: urls.full_url,
        original_filename: fileName,
        file_size_bytes: binaryData.length,
        processed: true,
        metadata: {
          sizes_generated: sizes.map(s => s.name),
          processing_timestamp: new Date().toISOString(),
          paths: uploadResults.map(r => r.path)
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao salvar banner na tabela:', insertError);
      throw insertError;
    }
    
    console.log('✅ Metadados salvos:', bannerData.id);

    // Update event with banner URL (use full size as default)
    console.log('🔄 Atualizando evento com banner URL...');
    const { error: updateError } = await supabase
      .from('events')
      .update({ 
        banner_url: urls.full_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('❌ Erro ao atualizar evento:', updateError);
      throw updateError;
    }

    console.log(`✅ Banner processado completamente: ${Object.keys(urls).length} tamanhos`);

    return new Response(
      JSON.stringify({
        success: true,
        banner_data: bannerData,
        urls: urls,
        message: 'Banner processado com sucesso',
        debug_info: debugInfo
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ ERRO CRÍTICO no processamento:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        error_type: error.constructor.name,
        timestamp: new Date().toISOString()
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