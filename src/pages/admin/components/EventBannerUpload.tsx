
import React, { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function EventBannerUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      alert("Imagem muito grande. Máx: 6MB");
      return;
    }

    setUploading(true);
    const filename = `event-banner-${Date.now()}-${file.name.replace(/[^\w.]/gi, "_")}`;
    const { error } = await supabase.storage
      .from("medical-cases")
      .upload(filename, file, { upsert: true });

    setUploading(false);
    if (!error) {
      const { data } = supabase.storage.from("medical-cases").getPublicUrl(filename);
      onChange(data.publicUrl);
    } else {
      alert("Erro ao fazer upload do banner.");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    onChange("");
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={16} className="mr-2" />
          {uploading ? "Enviando..." : (value ? "Trocar banner" : "Upload banner")}
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
      {value
        ? <img src={value} alt="Banner" className="rounded-xl max-h-32 border mt-1" />
        : <span className="text-xs text-gray-500 flex gap-1 items-center"><ImageIcon size={16}/> Nenhuma imagem enviada</span>
      }
      <span className="text-xs text-gray-500">Máx: 6MB. Imagem pública, formatos aceitos: png, jpg, jpeg, gif.</span>
    </div>
  );
}
