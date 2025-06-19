
import React from "react";
import { AdvancedImageUpload } from "./AdvancedImageUpload";

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
  renderTooltipTip: (id: string, text: string) => React.ReactNode;
};

export function CaseImageManagement({ value, onChange, renderTooltipTip }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">Sistema Inteligente de Imagens</h3>
        {renderTooltipTip("tip-smart-images", "Sistema avançado com auto-redimensionamento, múltiplos formatos e otimização automática.")}
      </div>
      
      <AdvancedImageUpload
        value={value}
        onChange={onChange}
        maxImages={6}
        allowedFormats={['image/jpeg', 'image/png', 'image/webp']}
        maxFileSize={10}
      />
    </div>
  );
}
