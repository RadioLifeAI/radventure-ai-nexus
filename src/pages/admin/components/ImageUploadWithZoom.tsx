
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

type Props = {
  value: string[]; // agora array de imagens
  onChange: (urls: string[]) => void;
};

export function ImageUploadWithZoom({ value = [], onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const externalRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<string[]>(value);
  // O zoom é apenas para o usuário final. Aqui sempre ajustado.
  // Componente admin fica sempre ajustado ao container.

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);
    let newImages: string[] = [];
    for (const file of fileList) {
      const filename = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("medical-cases")
        .upload(filename, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage.from("medical-cases").getPublicUrl(filename);
        newImages.push(data.publicUrl);
      } else {
        alert("Falha ao enviar imagem: " + file.name);
      }
    }
    const allImages = [...images, ...newImages];
    setImages(allImages);
    onChange(allImages);
    if (inputRef.current) inputRef.current.value = "";
    if (externalRef.current) externalRef.current.value = "";
  }

  function handleAddExternalFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const readers: Promise<string>[] = [];
    for (const file of Array.from(e.target.files)) {
      readers.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
    }
    Promise.all(readers).then((base64s) => {
      // Aqui, para não enviar ao storage, vamos apenas adicionar ao preview (não persistente).
      // Para simplificar, tratamos igual ao upload real.
      const allImages = [...images, ...base64s];
      setImages(allImages);
      onChange(allImages);
    });
  }

  function handleRemove(idx: number) {
    const newArr = images.filter((_, i) => i !== idx);
    setImages(newArr);
    onChange(newArr);
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[350px]">
      {/* Galeria de imagens */}
      <div className="flex gap-2 overflow-x-auto pb-2 w-full">
        {images.length > 0 ? (
          images.map((src, idx) => (
            <div
              className="relative w-32 h-32 bg-gray-200 rounded border flex items-center justify-center overflow-hidden flex-shrink-0"
              key={idx}
            >
              <img
                src={src}
                alt={`Imagem ${idx + 1}`}
                className="w-full h-full object-contain"
                draggable={false}
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-50 hover:bg-red-200 rounded p-0.5"
                title="Remover imagem"
                onClick={() => handleRemove(idx)}
              >
                <X size={18} className="text-red-500" />
              </button>
            </div>
          ))
        ) : (
          <span className="text-gray-400 text-sm m-auto">Nenhuma imagem adicionada</span>
        )}
      </div>
      <div className="flex gap-2 items-center w-full">
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          size="sm"
        >
          Upload Imagem
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
        <Button
          variant="secondary"
          type="button"
          size="sm"
          onClick={() => externalRef.current?.click()}
        >
          Adicionar de Arquivo Local
        </Button>
        <input
          ref={externalRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddExternalFiles}
        />
      </div>
    </div>
  );
}
