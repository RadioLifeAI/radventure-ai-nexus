import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  caseId: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ caseId, onUpload, disabled = false }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file || !caseId) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${caseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);

      // Insert into case_images table
      const { error: insertError } = await supabase
        .from('case_images')
        .insert({
          case_id: caseId,
          original_filename: file.name,
          original_url: publicUrl,
          bucket_path: filePath,
          sequence_order: 0,
          processing_status: 'completed'
        });

      if (insertError) {
        throw insertError;
      }

      // Call callback with URL
      onUpload(publicUrl);

      toast({
        title: "✅ Imagem enviada!",
        description: `${file.name} foi carregada com sucesso.`,
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !uploading) {
              document.getElementById('image-upload-input')?.click();
            }
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-lg font-medium text-blue-600">Enviando imagem...</p>
              <p className="text-sm text-gray-500">Aguarde o processamento</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-10 w-10 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Arraste uma imagem aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">
                  Suporte para JPEG, PNG, WebP • Máximo 10MB
                </p>
              </div>
            </div>
          )}
          
          <Input
            id="image-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />
        </div>
      </CardContent>
    </Card>
  );
}