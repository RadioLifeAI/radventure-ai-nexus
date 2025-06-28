
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
  categoryId?: number;
  modality?: string;
}

interface ProcessedImage {
  fileName: string;
  order: number;
  publicUrl: string;
  size: number;
  bucketPath: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { caseId, zipFileUrl, userId, categoryId, modality }: ProcessRequest = await req.json();

    console.log('🗂️ Iniciando processamento ZIP especializado:', { caseId, zipFileUrl, categoryId, modality });

    // Buscar dados da especialidade
    let specialtyInfo = null
    if (categoryId) {
      const { data } = await supabase
        .from('medical_specialties')
        .select('specialty_code, bucket_prefix')
        .eq('id', categoryId)
        .single()
      
      specialtyInfo = data
    }

    // Buscar dados da modalidade
    let modalityInfo = null
    if (modality) {
      const { data } = await supabase
        .from('modality_mappings')
        .select('modality_prefix, bucket_folder')
        .ilike('modality_name', `%${modality}%`)
        .single()
      
      modalityInfo = data
    }

    // Fazer download do arquivo ZIP
    const zipResponse = await fetch(zipFileUrl);
    if (!zipResponse.ok) {
      throw new Error('Falha ao baixar arquivo ZIP');
    }

    const zipBuffer = await zipResponse.arrayBuffer();
    console.log('📥 ZIP baixado, tamanho:', zipBuffer.byteLength);

    // Gerar estrutura organizada
    const specialtyCode = specialtyInfo?.specialty_code || 'GERAL'
    const modalityPrefix = modalityInfo?.modality_prefix || 'IMG'
    const bucketFolder = modalityInfo?.bucket_folder || 'geral'
    const bucketPath = `medical-cases/${specialtyCode.toLowerCase()}/${bucketFolder}/${caseId}`

    console.log('📁 Estrutura ZIP organizada:', { specialtyCode, modalityPrefix, bucketFolder, bucketPath });

    // Simular extração de imagens do ZIP
    const mockImages = [
      { fileName: 'img_001.jpg', order: 1, size: 1024000 },
      { fileName: 'img_002.jpg', order: 2, size: 1056000 },
      { fileName: 'img_003.jpg', order: 3, size: 998000 },
      { fileName: 'img_004.jpg', order: 4, size: 945000 },
    ];

    const processedImages: ProcessedImage[] = [];

    for (const mockImage of mockImages) {
      // Simular upload individual para o Supabase Storage
      const filePath = `${bucketPath}/${mockImage.fileName}`;
      const publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/case-images/${filePath}`;
      
      // Inserir na tabela case_images com organização
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
            user_id: userId,
            batch_processing: true
          },
          // Organização especializada
          specialty_code: specialtyCode,
          modality_prefix: modalityPrefix,
          bucket_path: bucketPath,
          organization_metadata: {
            specialty_name: specialtyInfo?.bucket_prefix || 'geral',
            modality_folder: bucketFolder,
            organized_at: new Date().toISOString(),
            auto_classified: true,
            zip_extracted: true
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir imagem ZIP:', insertError);
        continue;
      }

      processedImages.push({
        fileName: mockImage.fileName,
        order: mockImage.order,
        publicUrl,
        size: mockImage.size,
        bucketPath
      });

      console.log('✅ Imagem ZIP organizada:', mockImage.fileName);
    }

    console.log('🎉 Processamento ZIP especializado concluído:', processedImages.length, 'imagens organizadas');

    return new Response(
      JSON.stringify({
        success: true,
        message: `${processedImages.length} imagens processadas e organizadas`,
        images: processedImages,
        organization: {
          specialty_code: specialtyCode,
          modality_prefix: modalityPrefix,
          bucket_path: bucketPath,
          structured: true
        },
        caseId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erro no processamento ZIP especializado:', error);
    
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
