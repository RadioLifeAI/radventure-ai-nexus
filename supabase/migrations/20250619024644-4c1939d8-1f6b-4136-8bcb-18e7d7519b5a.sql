
-- FASE 1: Estrutura de Banco Robusta para Sistema de Imagens

-- Criar tabela dedicada para metadata rica de imagens
CREATE TABLE public.case_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.medical_cases(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  large_url TEXT,
  file_size_bytes INTEGER,
  dimensions JSONB DEFAULT '{}', -- {width, height, aspect_ratio}
  formats JSONB DEFAULT '{}', -- {webp_url, jpeg_url, avif_url}
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  metadata JSONB DEFAULT '{}', -- qualidade, compression_ratio, etc
  legend TEXT,
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_case_images_case_id ON public.case_images(case_id);
CREATE INDEX idx_case_images_processing_status ON public.case_images(processing_status);
CREATE INDEX idx_case_images_sequence ON public.case_images(case_id, sequence_order);

-- Habilitar RLS
ALTER TABLE public.case_images ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para case_images
CREATE POLICY "case_images_select_policy" ON public.case_images
FOR SELECT USING (true);

CREATE POLICY "case_images_insert_policy" ON public.case_images
FOR INSERT WITH CHECK (true);

CREATE POLICY "case_images_update_policy" ON public.case_images
FOR UPDATE USING (true);

CREATE POLICY "case_images_delete_policy" ON public.case_images
FOR DELETE USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_case_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER case_images_updated_at_trigger
  BEFORE UPDATE ON public.case_images
  FOR EACH ROW
  EXECUTE FUNCTION update_case_images_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.case_images IS 'Tabela para gerenciamento robusto de imagens de casos médicos com múltiplos tamanhos e formatos';
COMMENT ON COLUMN public.case_images.processing_status IS 'Status do processamento: pending, processing, completed, failed';
COMMENT ON COLUMN public.case_images.dimensions IS 'Dimensões originais: {width, height, aspect_ratio}';
COMMENT ON COLUMN public.case_images.formats IS 'URLs dos diferentes formatos: {webp_url, jpeg_url, avif_url}';
COMMENT ON COLUMN public.case_images.metadata IS 'Metadata rica: qualidade, compression_ratio, file_type, etc';
