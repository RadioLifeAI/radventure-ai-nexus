
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export function ImageUploadWithZoom({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [zoom, setZoom] = useState(1);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    const filename = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("medical-cases")
      .upload(filename, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("medical-cases").getPublicUrl(filename);
      setPreview(data.publicUrl);
      onChange(data.publicUrl);
    } else {
      alert("Falha ao enviar imagem.");
    }

    setUploading(false);
  }

  function handleSelectExternal() {
    const url = prompt("Cole a URL externa da imagem (ex: https://...)", "");
    if (url) {
      setPreview(url);
      onChange(url);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-60 h-60 bg-gray-200 rounded border flex items-center justify-center overflow-hidden">
        {preview ? (
          <img
            src={preview}
            alt="Pré-visualização"
            style={{ transform: `scale(${zoom})` }}
            className="transition-transform duration-200 w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-gray-400">Sem imagem</span>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          size="sm"
          disabled={uploading}
        >
          Upload Imagem
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={handleSelectExternal}
          size="sm"
        >
          Seleção Externa
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-center gap-1 ml-2">
          <label className="text-xs">Zoom</label>
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: 60 }}
          />
        </div>
      </div>
    </div>
  );
}
