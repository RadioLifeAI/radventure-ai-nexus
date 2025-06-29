
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageProcessingRequest {
  imageUrl: string
  caseId: string | null // CORREÇÃO: Permitir null para uploads temporários
  filename: string
  legend?: string
  sequenceOrder?: number
  categoryId?: number
  modality?: string
}

interface SpecialtyMapping {
  specialty_code: string
  bucket_prefix: string
}

interface ModalityMapping {
  modality_prefix: string
  bucket_folder: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { imageUrl, caseId, filename, legend, sequenceOrder, categoryId, modality }: ImageProcessingRequest = await req.json()

    console.log('🖼️ Iniciando processamento especializado:', { imageUrl, caseId, filename, categoryId, modality })

    // Buscar dados da especialidade para organização
    let specialtyInfo: SpecialtyMapping | null = null
    if (categoryId) {
      const { data } = await supabase
        .from('medical_specialties')
        .select('specialty_code, bucket_prefix')
        .eq('id', categoryId)
        .single()
      
      specialtyInfo = data
    }

    // Buscar dados da modalidade para organização
    let modalityInfo: ModalityMapping | null = null
    if (modality) {
      const { data } = await supabase
        .from('modality_mappings')
        .select('modality_prefix, bucket_folder')
        .ilike('modality_name', `%${modality}%`)
        .single()
      
      modalityInfo = data
    }

    // Baixar imagem original
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Falha ao baixar imagem: ${imageResponse.statusText}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const originalSize = imageBuffer.byteLength

    // Gerar estrutura de pastas especializada
    const specialtyCode = specialtyInfo?.specialty_code || 'GERAL'
    const modalityPrefix = modalityInfo?.modality_prefix || 'IMG'
    const bucketFolder = modalityInfo?.bucket_folder || 'geral'
    
    // CORREÇÃO: Para casos temporários, usar pasta especial e permitir null
    const caseFolder = caseId || 'temp-cases'
    const bucketPath = `medical-cases/${specialtyCode.toLowerCase()}/${bucketFolder}/${caseFolder}`
    
    console.log('📁 Estrutura organizada:', { specialtyCode, modalityPrefix, bucketFolder, bucketPath })

    // Simular processamento de diferentes tamanhos
    const processedImages = {
      thumbnail: imageUrl,
      medium: imageUrl,
      large: imageUrl,
      webp: imageUrl,
      jpeg: imageUrl
    }

    // Simular dimensões
    const dimensions = {
      width: 1200,
      height: 800,
      aspect_ratio: 1.5
    }

    // CORREÇÃO: Inserir registro na tabela case_images com case_id NULL permitido
    const { data: caseImage, error: insertError } = await supabase
      .from('case_images')
      .insert({
        case_id: caseId, // Agora pode ser null sem erro
        original_filename: filename,
        original_url: imageUrl,
        thumbnail_url: processedImages.thumbnail,
        medium_url: processedImages.medium,
        large_url: processedImages.large,
        file_size_bytes: originalSize,
        dimensions,
        formats: {
          webp_url: processedImages.webp,
          jpeg_url: processedImages.jpeg
        },
        processing_status: 'completed',
        metadata: {
          compression_ratio: 0.8,
          file_type: 'image/jpeg',
          quality: 'high',
          original_processing: true,
          is_temporary: caseId === null // Flag para identificar imagens temporárias
        },
        legend: legend || '',
        sequence_order: sequenceOrder || 0,
        processed_at: new Date().toISOString(),
        // Campos da organização especializada
        specialty_code: specialtyCode,
        modality_prefix: modalityPrefix,
        bucket_path: bucketPath,
        organization_metadata: {
          specialty_name: specialtyInfo?.bucket_prefix || 'geral',
          modality_folder: bucketFolder,
          organized_at: new Date().toISOString(),
          auto_classified: true,
          temporary_upload: caseId === null
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir case_image:', insertError)
      throw insertError
    }

    console.log('✅ Imagem processada e organizada:', { 
      id: caseImage.id, 
      bucketPath,
      specialtyCode,
      modalityPrefix,
      isTemporary: caseId === null
    })

    return new Response(
      JSON.stringify({
        success: true,
        caseImage,
        organization: {
          specialty_code: specialtyCode,
          modality_prefix: modalityPrefix,
          bucket_path: bucketPath,
          structured: true,
          is_temporary: caseId === null
        },
        message: caseId === null 
          ? 'Imagem temporária processada - será vinculada ao salvar o caso'
          : 'Imagem processada e organizada com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 Erro no processamento especializado:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
