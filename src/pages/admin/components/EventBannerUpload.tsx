
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle } from "lucide-react";
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
      const result = await uploadEventBanner(file, eventId);
      
      // Set all sizes in state for preview
      setPreviewUrls(result.urls);
      
      // Use full size as the main value
      onChange(result.urls.full_url);
    } catch (error) {
      console.error('Erro no upload:', error);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    onChange("");
    setPreviewUrls({});
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
          <p className="text-xs text-muted-foreground mt-1">Processando e otimizando imagem...</p>
        </div>
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
              <Badge variant="secondary" className="text-xs">
                <CheckCircle size={12} className="mr-1" />
                3 tamanhos gerados
              </Badge>
              <Badge variant="outline" className="text-xs">WebP otimizado</Badge>
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
        <p>• Máx: 15MB • Será otimizado automaticamente para WebP</p>
        <p>• Gera 3 tamanhos: thumb (400px), medium (800px), full (1600px)</p>
      </div>
    </div>
  );
}
