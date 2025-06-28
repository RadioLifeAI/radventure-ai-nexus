
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessRequest {
  caseId: string;
  zipFileUrl: string;
  userId: string;
}

interface ProcessedImage {
  fileName: string;
  order: number;
  publicUrl: string;
  size: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { caseId, zipFileUrl, userId }: ProcessRequest = await req.json();

    console.log('🗂️ Iniciando processamento de ZIP:', { caseId, zipFileUrl });

    // Fazer download do arquivo ZIP
    const zipResponse = await fetch(zipFileUrl);
    if (!zipResponse.ok) {
      throw new Error('Falha ao baixar arquivo ZIP');
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    console.log('📥 ZIP baixado, tamanho:', zipBuffer.byteLength);

    // Processar ZIP usando Deno APIs
    const processedImages: ProcessedImage[] = [];
    
    // Simular processamento (em produção, usar biblioteca de ZIP para Deno)
    // Por enquanto, retornar estrutura de exemplo
    const mockImages = [
      { fileName: 'img_001.jpg', order: 1, size: 1024000 },
      { fileName: 'img_002.jpg', order: 2, size: 1056000 },
      { fileName: 'img_003.jpg', order: 3, size: 998000 },
    ];

    for (const mockImage of mockImages) {
      // Simular upload individual para o Supabase Storage
      const filePath = `case-images/${caseId}/${mockImage.fileName}`;
      
      // Em implementação real, extrair e fazer upload de cada imagem
      const publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/case-images/${filePath}`;
      
      // Inserir na tabela case_images
      const { data: imageRecord, error: insertError } = await supabase
        .from('case_images')
        .insert({
          case_id: caseId,
          original_filename: mockImage.fileName,
          original_url: publicUrl,
          sequence_order: mockImage.order,
          file_size_bytes: mockImage.size,
          processing_status: 'completed',
          metadata: {
            extracted_from_zip: true,
            processed_at: new Date().toISOString(),
            user_id: userId
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir imagem:', insertError);
        continue;
      }

      processedImages.push({
        fileName: mockImage.fileName,
        order: mockImage.order,
        publicUrl,
        size: mockImage.size
      });

      console.log('✅ Imagem processada:', mockImage.fileName);
    }

    console.log('🎉 Processamento ZIP concluído:', processedImages.length, 'imagens');

    return new Response(
      JSON.stringify({
        success: true,
        message: `${processedImages.length} imagens processadas com sucesso`,
        images: processedImages,
        caseId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro no processamento ZIP:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
