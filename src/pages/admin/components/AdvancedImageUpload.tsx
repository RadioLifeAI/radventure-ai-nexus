
import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, Image, Loader2, ZoomIn, Eye, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type CaseImage = {
  id?: string;
  url: string;
  legend: string;
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  metadata?: {
    originalName: string;
    size: number;
    dimensions: { width: number; height: number };
    format: string;
    processed: boolean;
  };
};

type Props = {
  value: CaseImage[];
  onChange: (images: CaseImage[]) => void;
  maxImages?: number;
  allowedFormats?: string[];
  maxFileSize?: number; // em MB
};

// FUNÇÕES DE PROCESSAMENTO DE IMAGEM
const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.9): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar e comprimir
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/webp', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

const generateImageVariants = async (file: File): Promise<{
  original: Blob;
  thumbnail: Blob;
  medium: Blob;
  large: Blob;
}> => {
  const original = file;
  const thumbnail = await resizeImage(file, 300, 300, 0.8);
  const medium = await resizeImage(file, 800, 600, 0.85);
  const large = await resizeImage(file, 1200, 900, 0.9);
  
  return { original, thumbnail, medium, large };
};

const sanitizeFileName = (name: string): string => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
};

export function AdvancedImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 6,
  allowedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize = 10 // 10MB
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<CaseImage[]>(value);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (!allowedFormats.includes(file.type)) {
      toast({
        title: "Formato não suportado",
        description: `Formatos aceitos: ${allowedFormats.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: `Tamanho máximo: ${maxFileSize}MB`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const uploadImageVariant = async (blob: Blob, filename: string): Promise<string> => {
    const { error, data } = await supabase.storage
      .from("medical-cases")
      .upload(filename, blob, { upsert: true });

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from("medical-cases")
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
  };

  const processAndUploadImage = async (file: File): Promise<CaseImage> => {
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const baseName = sanitizedName.replace(/\.[^/.]+$/, "");
    
    try {
      // Gerar todas as variantes
      const variants = await generateImageVariants(file);
      
      // Upload paralelo de todas as variantes
      const [originalUrl, thumbnailUrl, mediumUrl, largeUrl] = await Promise.all([
        uploadImageVariant(variants.original, `${timestamp}-${baseName}-original.webp`),
        uploadImageVariant(variants.thumbnail, `${timestamp}-${baseName}-thumb.webp`),
        uploadImageVariant(variants.medium, `${timestamp}-${baseName}-medium.webp`),
        uploadImageVariant(variants.large, `${timestamp}-${baseName}-large.webp`)
      ]);

      // Obter dimensões da imagem original
      const img = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = URL.createObjectURL(file);
      });

      return {
        id: `img_${timestamp}`,
        url: originalUrl,
        thumbnail_url: thumbnailUrl,
        medium_url: mediumUrl,
        large_url: largeUrl,
        legend: "",
        metadata: {
          originalName: file.name,
          size: file.size,
          dimensions,
          format: file.type,
          processed: true
        }
      };
    } catch (error) {
      console.error('Erro no processamento da imagem:', error);
      throw error;
    }
  };

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const fileList = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = fileList.slice(0, remainingSlots);
    
    if (fileList.length > remainingSlots) {
      toast({
        title: "Limite de imagens atingido",
        description: `Máximo ${maxImages} imagens. ${fileList.length - remainingSlots} arquivo(s) ignorado(s).`,
        variant: "destructive"
      });
    }

    // Validar todos os arquivos primeiro
    const validFiles = filesToProcess.filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);
    
    try {
      const newImages: CaseImage[] = [];
      
      // Processar arquivos sequencialmente para evitar sobrecarga
      for (const file of validFiles) {
        try {
          const processedImage = await processAndUploadImage(file);
          newImages.push(processedImage);
          
          toast({
            title: "✅ Imagem processada",
            description: `${file.name} - Múltiplos tamanhos gerados`
          });
        } catch (error) {
          console.error(`Erro ao processar ${file.name}:`, error);
          toast({
            title: "Erro no upload",
            description: `Falha ao processar ${file.name}`,
            variant: "destructive"
          });
        }
      }
      
      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages].slice(0, maxImages);
        setImages(updatedImages);
        onChange(updatedImages);
        
        toast({
          title: "🎉 Upload concluído!",
          description: `${newImages.length} imagem(ns) processada(s) com sucesso`
        });
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [images, maxImages, onChange]);

  const handleRemove = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    onChange(newImages);
    
    toast({
      title: "Imagem removida",
      description: "Imagem removida da galeria"
    });
  };

  const handleLegendChange = (idx: number, legend: string) => {
    const newImages = [...images];
    newImages[idx] = { ...newImages[idx], legend };
    setImages(newImages);
    onChange(newImages);
  };

  const getDisplayUrl = (image: CaseImage): string => {
    return image.medium_url || image.url;
  };

  const getPreviewUrl = (image: CaseImage): string => {
    return image.large_url || image.url;
  };

  return (
    <div className="space-y-4">
      {/* Header com informações */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <Image className="h-5 w-5 text-blue-600" />
          <div>
            <div className="font-semibold text-blue-900">Sistema Inteligente de Imagens</div>
            <div className="text-sm text-blue-700">
              Auto-redimensionamento • Múltiplos formatos • Otimização automática
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-blue-700 border-blue-300">
          {images.length}/{maxImages}
        </Badge>
      </div>

      {/* Galeria de imagens */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Imagem */}
            <div className="aspect-square relative">
              <img
                src={getDisplayUrl(img)}
                alt={`Imagem ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPreviewImage(getPreviewUrl(img))}
                    className="h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(idx)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Badge de status */}
              {img.metadata?.processed && (
                <Badge className="absolute top-2 left-2 text-xs bg-green-500">
                  ✓ Processada
                </Badge>
              )}
            </div>
            
            {/* Legenda */}
            <div className="p-2">
              <Input
                value={img.legend}
                onChange={(e) => handleLegendChange(idx, e.target.value)}
                placeholder="Legenda da imagem"
                className="text-xs h-8"
              />
              
              {/* Metadata */}
              {img.metadata && (
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <div>📐 {img.metadata.dimensions.width}×{img.metadata.dimensions.height}px</div>
                  <div>💾 {(img.metadata.size / 1024 / 1024).toFixed(1)}MB</div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Slot para upload */}
        {images.length < maxImages && (
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
            <div className="text-sm text-gray-600 mt-2 text-center px-2">
              {uploading ? 'Processando...' : 'Clique para adicionar'}
            </div>
          </div>
        )}
      </div>

      {/* Input file oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={allowedFormats.join(',')}
        multiple
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />

      {/* Botão de upload alternativo */}
      <div className="flex justify-center">
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          variant="outline"
          className="w-full max-w-md"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Processando Imagens...' : 'Adicionar Imagens'}
        </Button>
      </div>

      {/* Modal de preview */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg space-y-1">
        <div>📋 <strong>Formatos aceitos:</strong> JPEG, PNG, WebP (até {maxFileSize}MB cada)</div>
        <div>🔄 <strong>Processamento automático:</strong> Gera 4 tamanhos (thumbnail, médio, grande, original)</div>
        <div>⚡ <strong>Otimização:</strong> Compressão inteligente sem perda de qualidade diagnóstica</div>
        <div>🔒 <strong>Privacidade:</strong> Remova dados pessoais antes do upload</div>
      </div>
    </div>
  );
}
