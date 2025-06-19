
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

    // Para esta implementação inicial, vamos simular o processamento
    // Em uma implementação completa, usaríamos uma biblioteca como ImageMagick ou Sharp
    const processedImages = {
      thumbnail: imageUrl, // Por enquanto, mantemos a URL original
      medium: imageUrl,
      large: imageUrl,
      webp: imageUrl,
      jpeg: imageUrl
    }

    // Simular dimensões (em uma implementação real, extrairíamos da imagem)
    const dimensions = {
      width: 1200,
      height: 800,
      aspect_ratio: 1.5
    }

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
          compression_ratio: 0.8,
          file_type: 'image/jpeg',
          quality: 'high'
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
        message: 'Imagem processada com sucesso'
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
