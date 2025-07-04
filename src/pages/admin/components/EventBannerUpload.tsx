
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useEventBannerUpload } from "@/hooks/useEventBannerUpload";

type Props = {
  value: string;
  onChange: (url: string) => void;
  eventId?: string;
};

export function EventBannerUpload({ value, onChange, eventId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{
    thumb_url?: string;
    medium_url?: string;
    full_url?: string;
  }>({});
  const [uploadStatus, setUploadStatus] = useState<{
    method?: 'edge_function' | 'direct_fallback';
    processed?: boolean;
    error?: string;
  }>({});
  
  const { uploadEventBanner, uploading } = useEventBannerUpload();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file) return;

    if (!eventId) {
      alert("ID do evento não encontrado.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Imagem muito grande. Máx: 15MB");
      return;
    }

    try {
      setUploadStatus({ error: undefined });
      const result = await uploadEventBanner(file, eventId);
      
      // Set all sizes in state for preview
      setPreviewUrls(result.urls);
      
      // Use full size as the main value
      onChange(result.urls.full_url);
      
      // Update status based on result
      setUploadStatus({
        method: result.fallback ? 'direct_fallback' : 'edge_function',
        processed: !result.fallback,
        error: undefined
      });
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadStatus({
        error: error.message,
        method: undefined,
        processed: false
      });
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    onChange("");
    setPreviewUrls({});
    setUploadStatus({});
  }

  const displayUrls = Object.keys(previewUrls).length > 0 ? previewUrls : {};
  const mainImage = value || displayUrls.full_url;

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Upload size={16} className="mr-2" />
          )}
          {uploading ? "Processando..." : (value ? "Trocar banner" : "Upload banner")}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        {value && (
          <button
            type="button"
            className="text-red-500 hover:text-red-700 ml-2"
            onClick={handleRemove}
            title="Remover banner"
          >
            <X size={18}/>
          </button>
        )}
      </div>

      {uploading && (
        <div className="w-full">
          <Progress value={65} className="w-full" />
          <p className="text-xs text-muted-foreground mt-1">
            Processando e otimizando imagem... (tentando método otimizado primeiro)
          </p>
        </div>
      )}

      {/* STATUS E ALERTAS */}
      {uploadStatus.error && (
        <Alert variant="destructive" className="w-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro no upload:</strong> {uploadStatus.error}
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus.method === 'direct_fallback' && (
        <Alert className="w-full border-orange-200 bg-orange-50">
          <Info className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Upload simplificado:</strong> Banner salvo com sucesso, mas sem otimização automática.
            O sistema otimizado não estava disponível no momento.
          </AlertDescription>
        </Alert>
      )}

      {mainImage && (
        <div className="w-full">
          <img 
            src={mainImage} 
            alt="Banner do evento" 
            className="rounded-xl max-h-32 border w-full object-cover" 
          />
          
          {Object.keys(displayUrls).length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {uploadStatus.method === 'edge_function' && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle size={12} className="mr-1" />
                  3 tamanhos gerados
                </Badge>
              )}
              
              {uploadStatus.method === 'direct_fallback' && (
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                  <AlertTriangle size={12} className="mr-1" />
                  Upload direto
                </Badge>
              )}
              
              {uploadStatus.processed && (
                <Badge variant="outline" className="text-xs">WebP otimizado</Badge>
              )}
              
              {!uploadStatus.processed && uploadStatus.method && (
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                  Não otimizado
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {!mainImage && !uploading && (
        <div className="text-center p-4 border-2 border-dashed border-muted rounded-lg w-full">
          <ImageIcon size={32} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma imagem enviada</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>• Máx: 15MB • Sistema híbrido com fallback automático</p>
        <p>• Tentará otimização WebP + 3 tamanhos primeiro, depois upload direto se necessário</p>
      </div>
    </div>
  );
}
