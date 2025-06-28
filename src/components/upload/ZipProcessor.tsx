
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Archive, 
  FileImage, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Loader2
} from 'lucide-react';
import JSZip from 'jszip';

interface ExtractedImage {
  name: string;
  file: File;
  order: number;
  size: string;
}

interface ZipProcessorProps {
  onImagesExtracted: (images: ExtractedImage[]) => void;
  onError: (error: string) => void;
}

export function ZipProcessor({ onImagesExtracted, onError }: ZipProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [processingStep, setProcessingStep] = useState('');

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'];
    return imageExtensions.some(ext => 
      filename.toLowerCase().endsWith(ext)
    );
  };

  const extractOrderFromFilename = (filename: string): number => {
    // Buscar padrões comuns de numeração
    const patterns = [
      /img_(\d+)/i,           // img_001.jpg
      /image_(\d+)/i,         // image_001.jpg
      /(\d+)\.jpg/i,          // 001.jpg
      /scan_(\d+)/i,          // scan_001.jpg
      /slice_(\d+)/i,         // slice_001.jpg
      /_(\d+)\./i,            // qualquer_001.jpg
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Se não encontrar padrão, usar posição alfabética
    return filename.toLowerCase().charCodeAt(0);
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const processZipFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setExtractedImages([]);
    
    try {
      setProcessingStep('Lendo arquivo ZIP...');
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      setProgress(20);
      setProcessingStep('Identificando imagens...');
      
      const imageFiles: { name: string; data: Uint8Array; order: number }[] = [];
      
      // Filtrar apenas arquivos de imagem
      for (const [filename, zipEntry] of Object.entries(zipData.files)) {
        if (!zipEntry.dir && isImageFile(filename)) {
          const data = await zipEntry.async('uint8array');
          const order = extractOrderFromFilename(filename);
          
          imageFiles.push({
            name: filename,
            data,
            order
          });
        }
      }
      
      setProgress(50);
      setProcessingStep('Ordenando imagens...');
      
      // Ordenar por número extraído do nome
      imageFiles.sort((a, b) => a.order - b.order);
      
      setProgress(70);
      setProcessingStep('Convertendo para arquivos...');
      
      const extractedImages: ExtractedImage[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        
        const blob = new Blob([imageFile.data], { type: mimeType });
        const file = new File([blob], imageFile.name, {
          type: mimeType,
          lastModified: Date.now()
        });
        
        extractedImages.push({
          name: imageFile.name,
          file,
          order: i + 1, // Ordem sequencial final
          size: formatFileSize(file.size)
        });
        
        setProgress(70 + (i / imageFiles.length) * 25);
      }
      
      setProgress(100);
      setProcessingStep('Concluído!');
      setExtractedImages(extractedImages);
      onImagesExtracted(extractedImages);
      
    } catch (error) {
      console.error('Erro ao processar ZIP:', error);
      onError(`Erro ao processar arquivo ZIP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
        processZipFile(file);
      } else {
        onError('Por favor, selecione um arquivo ZIP válido.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Processador de ZIP
            <Badge variant="secondary">Profissional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Archive className="h-10 w-10 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                Selecione um arquivo ZIP com imagens médicas
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formatos aceitos: img_001.jpg, image_001.png, scan_001.jpg, etc.
              </p>
              
              <input
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
                id="zip-upload"
                disabled={isProcessing}
              />
              
              <Button asChild disabled={isProcessing}>
                <label htmlFor="zip-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processando...' : 'Selecionar ZIP'}
                </label>
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{processingStep}</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-gray-500">{progress.toFixed(0)}% concluído</p>
              </div>
            )}

            {extractedImages.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    {extractedImages.length} imagens extraídas com sucesso!
                  </span>
                </div>
                
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {extractedImages.map((img, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{img.name}</span>
                        <Badge variant="outline" className="text-xs">#{img.order}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">{img.size}</span>
                    </div>
                  ))}
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    As imagens foram ordenadas automaticamente. Você pode prosseguir com o upload.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
