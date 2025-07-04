import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
}

// Função simplificada sem ImageMagick (temporariamente desabilitado)
async function processImageFormats(imageBuffer: ArrayBuffer) {
  // Por enquanto, retornar apenas a imagem original
  // ImageMagick será reativado quando o módulo estiver funcionando
  return {
    processed: {
      original: imageBuffer
    },
    dimensions: {
      width: 1024,
      height: 768,
      aspect_ratio: 1024 / 768
    }
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

    const { imageUrl, caseId, filename, legend, sequenceOrder }: ImageProcessingRequest = await req.json()

    console.log('🖼️ Iniciando processamento de imagem:', { imageUrl, caseId, filename })

    // Baixar imagem original
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Falha ao baixar imagem: ${imageResponse.statusText}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const originalSize = imageBuffer.byteLength

    console.log('📊 Imagem original baixada:', { size: originalSize, filename })

    // Processar imagem (versão simplificada temporária)
    console.log('🔄 Processamento simplificado (sem ImageMagick)...')
    const { dimensions } = await processImageFormats(imageBuffer)
    
    // Upload da imagem original para o storage
    const folderPath = `case-images/${caseId}`
    const originalPath = `${folderPath}/${filename}`
    
    const { data: originalUpload } = await supabase.storage
      .from('case-images')
      .upload(originalPath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    // Gerar URL pública
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
    
    console.log('✨ Imagem armazenada:', { originalUrl })

    // Inserir registro na tabela case_images
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
          compression_ratio: 1.0,
          file_type: 'image/jpeg',
          quality: 'original',
          imagemagick_disabled: true,
          original_processing: true,
          original_format: filename.split('.').pop()?.toLowerCase()
        },
        legend: legend || '',
        sequence_order: sequenceOrder || 0,
        processed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir case_image:', insertError)
      throw insertError
    }

    console.log('✅ Imagem processada com sucesso:', caseImage.id)

    return new Response(
      JSON.stringify({
        success: true,
        caseImage,
        message: 'Imagem processada com sucesso (versão simplificada)'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('💥 Erro no processamento:', error)
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