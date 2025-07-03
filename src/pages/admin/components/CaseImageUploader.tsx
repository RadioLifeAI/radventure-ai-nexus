import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  ImageIcon, 
  Upload, 
  X, 
  CheckCircle, 
  Loader2,
  Eye,
  Trash2
} from 'lucide-react';

interface CaseImageUploaderProps {
  caseId: string;
  onUploadComplete?: () => void;
}

interface ImageUploadItem {
  id: string;
  file: File;
  url: string;
  uploading: boolean;
  progress: number;
  uploaded: boolean;
  error?: string;
}

interface ExistingImage {
  id: string;
  original_url: string;
  original_filename: string;
  sequence_order: number;
}

export function CaseImageUploader({ caseId, onUploadComplete }: CaseImageUploaderProps) {
  const [uploadQueue, setUploadQueue] = useState<ImageUploadItem[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar imagens existentes
  useEffect(() => {
    loadExistingImages();
  }, [caseId]);

  const loadExistingImages = async () => {
    try {
      const { data, error } = await supabase
        .from('case_images')
        .select('id, original_url, original_filename, sequence_order')
        .eq('case_id', caseId)
        .eq('processing_status', 'completed')
        .order('sequence_order');

      if (error) throw error;
      setExistingImages(data || []);
    } catch (error) {
      console.error('Erro ao carregar imagens existentes:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newItems: ImageUploadItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validações
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: `${file.name} não é uma imagem válida.`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 10MB.`,
          variant: "destructive"
        });
        continue;
      }

      const imageItem: ImageUploadItem = {
        id: `upload_${Date.now()}_${i}`,
        file,
        url: URL.createObjectURL(file),
        uploading: false,
        progress: 0,
        uploaded: false
      };

      newItems.push(imageItem);
    }

    setUploadQueue(prev => [...prev, ...newItems]);
    event.target.value = '';
  };

  const uploadSingleImage = async (item: ImageUploadItem): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Atualizar estado: iniciando upload
        setUploadQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, uploading: true, progress: 10 } : i
        ));

        // Definir path correto (SEM duplicação)
        const filename = `${Date.now()}_${item.file.name}`;
        const filePath = `${caseId}/${filename}`;

        // Upload para storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('case-images')
          .upload(filePath, item.file);

        if (uploadError) throw uploadError;

        // Progresso 50%
        setUploadQueue(prev => prev.map(i => 
          i.id === item.id ? { ...i, progress: 50 } : i
        ));

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('case-images')
          .getPublicUrl(filePath);

        // Calcular sequence_order
        const existingSequences = existingImages.map(img => img.sequence_order);
        const uploadedCount = uploadQueue.filter(u => u.uploaded).length;
        const nextSequence = Math.max(...existingSequences, uploadedCount - 1, -1) + 1;

        // Inserir em case_images
        const { error: insertError } = await supabase
          .from('case_images')
          .insert({
            case_id: caseId,
            original_filename: item.file.name,
            original_url: publicUrl,
            processing_status: 'completed',
            sequence_order: nextSequence
          });

        if (insertError) throw insertError;

        // Progresso 100% - concluído
        setUploadQueue(prev => prev.map(i => 
          i.id === item.id ? { 
            ...i, 
            uploading: false, 
            uploaded: true, 
            progress: 100 
          } : i
        ));

        // Recarregar imagens existentes
        await loadExistingImages();
        
        resolve();
      } catch (error: any) {
        console.error('Erro no upload:', error);
        
        setUploadQueue(prev => prev.map(i => 
          i.id === item.id ? { 
            ...i, 
            uploading: false, 
            error: error.message || 'Erro no upload'
          } : i
        ));
        
        reject(error);
      }
    });
  };

  const uploadAllImages = async () => {
    setLoading(true);
    
    const pendingUploads = uploadQueue.filter(item => !item.uploaded && !item.error);
    
    try {
      // Upload sequencial para melhor controle
      for (const item of pendingUploads) {
        await uploadSingleImage(item);
      }
      
      toast({
        title: "✅ Upload Concluído!",
        description: `${pendingUploads.length} imagem(ns) salva(s) com sucesso.`,
      });
      
      onUploadComplete?.();
      
      // Limpar fila de upload após sucesso
      setUploadQueue([]);
      
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Alguns arquivos falharam. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromQueue = (itemId: string) => {
    setUploadQueue(prev => {
      const item = prev.find(i => i.id === itemId);
      if (item?.url) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const deleteExistingImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('case_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso."
      });

      await loadExistingImages();
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Gestão de Imagens - Sistema Nativo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload direto para o caso ID: <code className="bg-muted px-1 rounded">{caseId}</code>
          </p>
        </CardHeader>
      </Card>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecionar Imagens</h3>
            <p className="text-muted-foreground mb-4">
              Arraste arquivos ou clique para selecionar
            </p>
            
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <Button disabled={loading} className="pointer-events-none">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imagens Existentes */}
      {existingImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Imagens Salvas ({existingImages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img 
                      src={image.original_url} 
                      alt={image.original_filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={() => window.open(image.original_url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-red-500/80"
                      onClick={() => deleteExistingImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-1 truncate">
                    {image.original_filename}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fila de Upload */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Fila de Upload ({uploadQueue.length})</CardTitle>
              <Button 
                onClick={uploadAllImages}
                disabled={loading || uploadQueue.every(i => i.uploaded || i.error)}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Fazer Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={item.url} 
                      alt={item.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {item.uploading && (
                      <Progress value={item.progress} className="mt-2 h-1" />
                    )}
                    
                    {item.error && (
                      <p className="text-xs text-destructive mt-1">{item.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.uploaded && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Salvo
                      </Badge>
                    )}
                    
                    {item.uploading && (
                      <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Enviando
                      </Badge>
                    )}
                    
                    {item.error && (
                      <Badge variant="destructive">Erro</Badge>
                    )}
                    
                    {!item.uploading && !item.uploaded && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromQueue(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
        💡 <strong>Sistema Nativo:</strong> Upload direto para case-images/{caseId}/ e inserção automática em case_images
      </div>
    </div>
  );
}