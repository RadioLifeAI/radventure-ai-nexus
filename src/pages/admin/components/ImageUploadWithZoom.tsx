
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, Image } from "lucide-react";

type CaseImage = {
  url: string;     // url ou base64
  legend: string;  // legenda da imagem
};

type Props = {
  value: CaseImage[]; // agora array de { url, legend }
  onChange: (images: CaseImage[]) => void;
};

export function ImageUploadWithZoom({ value = [], onChange }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const localRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<CaseImage[]>(value);

  // Anexar ao array e render, com campo legenda incluso
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files).slice(0, 6 - images.length); // máx 6 imagens
    let newImages: CaseImage[] = [];
    for (const file of fileList) {
      // validação tipo/tamanho
      if (!file.type.startsWith("image/")) {
        alert("Tipo de arquivo não permitido. Somente imagens.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`Imagem muito grande (${file.name}). Máx: 5MB`);
        continue;
      }

      const filename = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("medical-cases")
        .upload(filename, file, { upsert: true });

      if (!error) {
        const { data } = supabase.storage.from("medical-cases").getPublicUrl(filename);
        newImages.push({ url: data.publicUrl, legend: "" });
      } else {
        alert("Falha ao enviar imagem: " + file.name);
      }
    }
    const all = [...images, ...newImages].slice(0, 6);
    setImages(all);
    onChange(all);
    if (inputRef.current) inputRef.current.value = "";
    if (localRef.current) localRef.current.value = "";
  }

  function handleLocal(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 6 - images.length);
    const readers: Promise<CaseImage>[] = [];
    for (const file of files) {
      readers.push(
        new Promise((resolve, reject) => {
          if (!file.type.startsWith("image/")) {
            alert("Tipo de arquivo não permitido. Somente imagens.");
            reject();
            return;
          }
          if (file.size > 5 * 1024 * 1024) {
            alert(`Imagem muito grande (${file.name}). Máx: 5MB`);
            reject();
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev) => resolve({ url: ev.target?.result as string, legend: "" });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
    }
    Promise.all(readers).then((base64imgs) => {
      const all = [...images, ...base64imgs].slice(0, 6);
      setImages(all);
      onChange(all);
    });
  }

  function handleRemove(idx: number) {
    const newArr = images.filter((_, i) => i !== idx);
    setImages(newArr);
    onChange(newArr);
  }

  function handleLegendChange(idx: number, legend: string) {
    const newArr = [...images];
    newArr[idx] = { ...newArr[idx], legend };
    setImages(newArr);
    onChange(newArr);
  }

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-[350px]">
      <div className="text-xs text-gray-600 mt-2 text-center">
        Permitido: até 6 imagens • Máx: 5MB cada • Tipos: jpg, jpeg, png, gif<br/>
        Recomendação: utilize imagens anonimizadas, não insira dados sensíveis.
      </div>
      {/* Galeria de imagens */}
      <div className="flex gap-2 overflow-x-auto pb-2 w-full mt-2">
        {images.length > 0 ? (
          images.map((img, idx) => (
            <div
              className="relative w-32 h-32 bg-gray-200 rounded border flex flex-col items-center justify-center overflow-hidden flex-shrink-0"
              key={idx}
            >
              <img
                src={img.url}
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
              <input
                type="text"
                placeholder="Legenda/Referência"
                className="w-full px-1 py-0.5 text-xs border-t border-gray-300 mt-1 rounded-b bg-gray-100 outline-none focus:ring"
                value={img.legend}
                onChange={e => handleLegendChange(idx, e.target.value)}
                aria-label="Legenda da imagem"
              />
            </div>
          ))
        ) : (
          <span className="text-gray-400 text-sm m-auto flex flex-col items-center">
            <Image size={36} className="mx-auto mb-2" />
            Nenhuma imagem adicionada
          </span>
        )}
      </div>
      <div className="flex gap-2 items-center w-full">
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          size="sm"
          variant="default"
        >
          <Upload size={16} className="mr-2" />
          Upload Imagem
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif"
          className="hidden"
          multiple
          onChange={handleUpload}
        />
        <Button
          variant="secondary"
          type="button"
          size="sm"
          onClick={() => localRef.current?.click()}
        >
          <Image size={16} className="mr-2" />
          Upload Outra Imagem
        </Button>
        <input
          ref={localRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif"
          multiple
          className="hidden"
          onChange={handleLocal}
        />
      </div>
    </div>
  );
}
