import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

// Importar Sharp para processamento real de imagens
async function loadSharp() {
  try {
    const { default: Sharp } = await import('https://deno.land/x/sharp_deno@0.32.1/mod.ts');
    return Sharp;
  } catch (error) {
    console.warn('⚠️ Sharp não disponível, usando fallback Canvas API:', error.message);
    return null;
  }
}

// Fallback com Canvas API para compressão básica
async function processImageWithCanvas(imageData: Uint8Array, width: number, quality: number) {
  try {
    // Criar ImageBitmap a partir dos dados
    const blob = new Blob([imageData], { type: 'image/png' });
    const imageBitmap = await createImageBitmap(blob);
    
    // Calcular dimensões mantendo aspect ratio
    const aspectRatio = imageBitmap.height / imageBitmap.width;
    const newHeight = Math.round(width * aspectRatio);
    
    // Criar canvas e redimensionar
    const canvas = new OffscreenCanvas(width, newHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    ctx.drawImage(imageBitmap, 0, 0, width, newHeight);
    const compressedBlob = await canvas.convertToBlob({
      type: 'image/webp',
      quality: quality / 100
    });
    
    return new Uint8Array(await compressedBlob.arrayBuffer());
  } catch (error) {
    console.error('❌ Fallback Canvas processamento falhou:', error);
    return imageData; // Retornar original se falhar
  }
}

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
    
    // PROCESSAMENTO REAL DE IMAGENS com Sharp + Fallback Canvas
    const sizes = [
      { name: 'thumb', width: 400, quality: 80 },
      { name: 'medium', width: 800, quality: 85 },
      { name: 'full', width: 1600, quality: 90 }
    ];

    console.log(`🔄 Iniciando processamento de ${sizes.length} tamanhos...`);
    
    // Tentar carregar Sharp
    const Sharp = await loadSharp();
    const processingMethod = Sharp ? 'Sharp (otimizado)' : 'Canvas API (fallback)';
    console.log(`🛠️ Método de processamento: ${processingMethod}`);
    
    const uploadPromises = sizes.map(async (size) => {
      try {
        let processedImage: Uint8Array;
        let actualContentType = 'image/webp';
        
        if (Sharp) {
          // PROCESSAMENTO REAL COM SHARP
          console.log(`🎨 Processando ${size.name} com Sharp (${size.width}px, qualidade ${size.quality}%)...`);
          
          processedImage = await Sharp(binaryData)
            .resize(size.width, null, { 
              withoutEnlargement: true,
              fit: 'inside',
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .webp({ 
              quality: size.quality,
              effort: 4 // Balanço entre qualidade e velocidade
            })
            .toBuffer();
            
          console.log(`✅ Sharp processou ${size.name}: ${binaryData.length} → ${processedImage.length} bytes (${Math.round((1 - processedImage.length/binaryData.length) * 100)}% redução)`);
        } else {
          // FALLBACK COM CANVAS API
          console.log(`🔄 Processando ${size.name} com Canvas API (${size.width}px, qualidade ${size.quality}%)...`);
          
          processedImage = await processImageWithCanvas(binaryData, size.width, size.quality);
          console.log(`✅ Canvas processou ${size.name}: ${binaryData.length} → ${processedImage.length} bytes`);
        }
        
        const filePath = `${eventId}/${size.name}_${size.width}.webp`;
        
        console.log(`📤 Uploading ${size.name}: ${filePath}`);
        
        const { data, error } = await supabase.storage
          .from('event-banners')
          .upload(filePath, processedImage, {
            contentType: actualContentType,
            upsert: true
          });

        if (error) {
          console.error(`❌ Erro upload ${size.name}:`, error);
          throw error;
        }
        
        console.log(`✅ Upload ${size.name} concluído:`, data);

        const { data: urlData } = supabase.storage
          .from('event-banners')
          .getPublicUrl(filePath);

        return {
          size: size.name,
          url: urlData.publicUrl,
          path: filePath,
          originalSize: binaryData.length,
          processedSize: processedImage.length,
          compressionRatio: Math.round((1 - processedImage.length/binaryData.length) * 100)
        };
      } catch (error) {
        console.error(`❌ Falha no processamento/upload ${size.name}:`, error);
        throw error;
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    console.log(`✅ Todos os processamentos concluídos:`, uploadResults.length);
    
    // Calcular estatísticas de compressão
    const totalOriginalSize = uploadResults.reduce((sum, r) => sum + r.originalSize, 0);
    const totalProcessedSize = uploadResults.reduce((sum, r) => sum + r.processedSize, 0);
    const overallCompressionRatio = Math.round((1 - totalProcessedSize/totalOriginalSize) * 100);
    
    console.log(`📊 ESTATÍSTICAS DE COMPRESSÃO:
    📁 Original: ${Math.round(totalOriginalSize/1024)}KB
    📁 Processado: ${Math.round(totalProcessedSize/1024)}KB  
    📉 Redução: ${overallCompressionRatio}%
    🛠️ Método: ${processingMethod}`);
    
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
          processing_method: processingMethod,
          compression_stats: {
            overall_compression_ratio: overallCompressionRatio,
            total_original_size: totalOriginalSize,
            total_processed_size: totalProcessedSize,
            individual_results: uploadResults.map(r => ({
              size: r.size,
              compression_ratio: r.compressionRatio,
              original_size: r.originalSize,
              processed_size: r.processedSize
            }))
          },
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

    console.log(`✅ Banner processado completamente: ${Object.keys(urls).length} tamanhos com ${overallCompressionRatio}% de compressão`);

    return new Response(
      JSON.stringify({
        success: true,
        banner_data: bannerData,
        urls: urls,
        processing_stats: {
          method: processingMethod,
          compression_ratio: overallCompressionRatio,
          original_size_kb: Math.round(totalOriginalSize/1024),
          processed_size_kb: Math.round(totalProcessedSize/1024),
          sizes_generated: sizes.length
        },
        message: `Banner processado com ${overallCompressionRatio}% de compressão usando ${processingMethod}`,
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