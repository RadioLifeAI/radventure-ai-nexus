
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ImageMagick, initialize, MagickFormat } from "https://deno.land/x/imagemagick@0.0.26/mod.ts"

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

// Inicializar ImageMagick
await initialize()

// Função para processar imagem em diferentes formatos e tamanhos
async function processImageFormats(imageBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(imageBuffer)
  const processed: any = {}
  
  try {
    // Obter dimensões originais
    let originalWidth = 0, originalHeight = 0
    
    ImageMagick.read(uint8Array, (img) => {
      originalWidth = img.width
      originalHeight = img.height
    })
    
    const aspectRatio = originalWidth / originalHeight
    
    // Thumbnail: 300x200
    const thumbnailWidth = 300
    const thumbnailHeight = Math.round(thumbnailWidth / aspectRatio)
    
    // Medium: 800x600
    const mediumWidth = 800
    const mediumHeight = Math.round(mediumWidth / aspectRatio)
    
    // Large: manter original até 1920px
    const largeWidth = Math.min(originalWidth, 1920)
    const largeHeight = Math.round(largeWidth / aspectRatio)
    
    // Processar thumbnail
    ImageMagick.read(uint8Array, (img) => {
      img.resize(thumbnailWidth, thumbnailHeight)
      img.format = MagickFormat.Webp
      img.quality = 85
      processed.thumbnail_webp = img.writeToBlob()
    })
    
    // Processar medium
    ImageMagick.read(uint8Array, (img) => {
      img.resize(mediumWidth, mediumHeight)
      img.format = MagickFormat.Webp
      img.quality = 85
      processed.medium_webp = img.writeToBlob()
    })
    
    // Processar large
    ImageMagick.read(uint8Array, (img) => {
      if (originalWidth > 1920) {
        img.resize(largeWidth, largeHeight)
      }
      img.format = MagickFormat.Webp
      img.quality = 90
      processed.large_webp = img.writeToBlob()
    })
    
    return {
      processed,
      dimensions: {
        width: originalWidth,
        height: originalHeight,
        aspect_ratio: aspectRatio
      }
    }
  } catch (error) {
    console.error('Erro no processamento de imagem:', error)
    throw error
  }
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

    // Processar imagem em diferentes formatos e tamanhos
    console.log('🔄 Processando imagem especializada em WebP...')
    const { processed, dimensions } = await processImageFormats(imageBuffer)
    
    // Upload das versões processadas para o storage com estrutura especializada
    const baseFilename = filename.split('.')[0]
    
    // Upload thumbnail WebP
    const thumbnailWebpPath = `${bucketPath}/${baseFilename}_thumb.webp`
    const { data: thumbWebpUpload } = await supabase.storage
      .from('case-images')
      .upload(thumbnailWebpPath, processed.thumbnail_webp, {
        contentType: 'image/webp',
        upsert: true
      })
    
    // Upload medium WebP
    const mediumWebpPath = `${bucketPath}/${baseFilename}_medium.webp`
    const { data: mediumWebpUpload } = await supabase.storage
      .from('case-images')
      .upload(mediumWebpPath, processed.medium_webp, {
        contentType: 'image/webp',
        upsert: true
      })
    
    // Upload large WebP
    const largeWebpPath = `${bucketPath}/${baseFilename}_large.webp`
    const { data: largeWebpUpload } = await supabase.storage
      .from('case-images')
      .upload(largeWebpPath, processed.large_webp, {
        contentType: 'image/webp',
        upsert: true
      })
    
    // Gerar URLs públicas
    const { data: { publicUrl: thumbnailWebpUrl } } = supabase.storage
      .from('case-images')
      .getPublicUrl(thumbnailWebpPath)
    
    const { data: { publicUrl: mediumWebpUrl } } = supabase.storage
      .from('case-images')
      .getPublicUrl(mediumWebpPath)
    
    const { data: { publicUrl: largeWebpUrl } } = supabase.storage
      .from('case-images')
      .getPublicUrl(largeWebpPath)

    const processedImages = {
      thumbnail: thumbnailWebpUrl,
      medium: mediumWebpUrl,
      large: largeWebpUrl,
      webp: largeWebpUrl, // URL principal em WebP
      jpeg: imageUrl // Manter original como JPEG
    }
    
    console.log('✨ Imagem especializada processada em WebP:', { 
      bucketPath,
      thumbnail: thumbnailWebpUrl,
      medium: mediumWebpUrl, 
      large: largeWebpUrl 
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
