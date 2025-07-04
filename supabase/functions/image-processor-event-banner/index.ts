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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { file, eventId, fileName }: ProcessRequest = await req.json();
    
    console.log(`🖼️ Processando banner para evento: ${eventId}`);
    
    // Decode base64 to binary
    const binaryData = Uint8Array.from(atob(file), c => c.charCodeAt(0));
    
    // Simulate processing for 3 sizes (WebP)
    // In real implementation, use Sharp for resizing
    const sizes = [
      { name: 'thumb', width: 400, quality: 80 },
      { name: 'medium', width: 800, quality: 85 },
      { name: 'full', width: 1600, quality: 90 }
    ];

    const uploadPromises = sizes.map(async (size) => {
      // Simulate image processing (would be Sharp in real implementation)
      const processedImage = binaryData;
      
      const filePath = `${eventId}/${size.name}_${size.width}.webp`;
      
      const { data, error } = await supabase.storage
        .from('event-banners')
        .upload(filePath, processedImage, {
          contentType: 'image/webp',
          upsert: true
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('event-banners')
        .getPublicUrl(filePath);

      return {
        size: size.name,
        url: urlData.publicUrl
      };
    });

    const uploadResults = await Promise.all(uploadPromises);
    
    // Organize URLs by size
    const urls = uploadResults.reduce((acc, result) => ({
      ...acc,
      [`${result.size}_url`]: result.url
    }), {});

    // Save to event_banner_images table
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
          processing_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao salvar banner:', insertError);
      throw insertError;
    }

    // Update event with banner URL (use full size as default)
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

    console.log(`✅ Banner processado: ${Object.keys(urls).length} tamanhos`);

    return new Response(
      JSON.stringify({
        success: true,
        banner_data: bannerData,
        urls: urls,
        message: 'Banner processado com sucesso'
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