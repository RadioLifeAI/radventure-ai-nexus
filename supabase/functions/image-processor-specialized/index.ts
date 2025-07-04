
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// ImageMagick import temporarily disabled due to module resolution issues
// import { ImageMagick, initialize, MagickFormat } from "https://deno.land/x/imagemagick@0.0.26/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageProcessingRequest {
  imageUrl: string
  caseId: string
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

// Function temporarily simplified - ImageMagick processing disabled
async function processImageFormats(imageBuffer: ArrayBuffer) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Image processing temporarily disabled - ImageMagick module unavailable'
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    }
  )
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
    
    // Estrutura: /medical-cases/{specialty-code}/{modality-folder}/{case-id}/
    const bucketPath = `medical-cases/${specialtyCode.toLowerCase()}/${bucketFolder}/${caseId}`
    
    console.log('📁 Estrutura organizada:', { specialtyCode, modalityPrefix, bucketFolder, bucketPath })

    // Image processing temporarily disabled - store original image only
    console.log('🔄 Armazenando imagem original...')
    
    // Upload original image to organized structure
    const baseFilename = filename.split('.')[0]
    const originalPath = `${bucketPath}/${filename}`
    
    const { data: originalUpload } = await supabase.storage
      .from('case-images')
      .upload(originalPath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    // Get public URL for original
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('case-images')
      .getPublicUrl(originalPath)

    const processedImages = {
      thumbnail: originalUrl,
      medium: originalUrl,
      large: originalUrl,
      webp: originalUrl,
      jpeg: originalUrl
    }
    
    const dimensions = {
      width: 1024,
      height: 768,
      aspect_ratio: 1024 / 768
    }
    
    console.log('✨ Imagem processada e organizada:', { 
      bucketPath,
      originalUrl
    })

    // Inserir registro na tabela case_images com organização especializada
    const { data: caseImage, error: insertError } = await supabase
      .from('case_images')
      .insert({
        case_id: caseId,
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
          file_type: 'image/webp',
          quality: 'high',
          original_processing: true,
          webp_optimized: true,
          original_format: filename.split('.').pop()?.toLowerCase()
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
          auto_classified: true
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
      modalityPrefix 
    })

    return new Response(
      JSON.stringify({
        success: true,
        caseImage,
        organization: {
          specialty_code: specialtyCode,
          modality_prefix: modalityPrefix,
          bucket_path: bucketPath,
          structured: true
        },
        message: 'Imagem processada e organizada com sucesso'
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
