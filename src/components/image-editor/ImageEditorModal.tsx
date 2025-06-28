
import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Crop, 
  RotateCcw, 
  Download, 
  Check, 
  X, 
  Sun, 
  Contrast,
  ZoomIn,
  Square
} from 'lucide-react';
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditorModalProps {
  open: boolean;
  onClose: () => void;
  file: File;
  onSave: (editedFile: File) => void;
}

export function ImageEditorModal({ open, onClose, file, onSave }: ImageEditorModalProps) {
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [zoom, setZoom] = useState([100]);
  const [force1to1, setForce1to1] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    
    // Crop inicial de 80% da imagem
    const cropSize = Math.min(width, height) * 0.8;
    const x = (width - cropSize) / 2;
    const y = (height - cropSize) / 2;
    
    const initialCrop: CropType = {
      unit: 'px',
      x,
      y,
      width: cropSize,
      height: force1to1 ? cropSize : cropSize * 0.75,
    };
    
    setCrop(initialCrop);
  }, [force1to1]);

  const toggleAspectRatio = () => {
    setForce1to1(!force1to1);
    if (!force1to1 && crop) {
      // Forçar 1:1
      const size = Math.min(crop.width, crop.height);
      setCrop({
        ...crop,
        width: size,
        height: size,
      });
    }
  };

  const resetAdjustments = () => {
    setBrightness([100]);
    setContrast([100]);
    setZoom([100]);
    setCrop(undefined);
  };

  const generateEditedImage = async (): Promise<File> => {
    const canvas = canvasRef.current;
    const image = imgRef.current;
    
    if (!canvas || !image) {
      throw new Error('Canvas or image not available');
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Configurar canvas
    const cropData = completedCrop || crop;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = cropData ? cropData.width * scaleX : image.naturalWidth;
    canvas.height = cropData ? cropData.height * scaleY : image.naturalHeight;

    // Aplicar filtros
    ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`;
    
    if (cropData) {
      ctx.drawImage(
        image,
        cropData.x * scaleX,
        cropData.y * scaleY,
        cropData.width * scaleX,
        cropData.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
    } else {
      ctx.drawImage(image, 0, 0);
    }

    // Converter para File
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const editedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(editedFile);
        }
      }, file.type, 0.95);
    });
  };

  const handleSave = async () => {
    try {
      const editedFile = await generateEditedImage();
      onSave(editedFile);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar imagem editada:', error);
    }
  };

  const imageStyle = {
    filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`,
    transform: `scale(${zoom[0] / 100})`,
    transformOrigin: 'center',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Editor de Imagem Médica
            <Badge variant="secondary">Profissional</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Área de Edição */}
          <div className="flex-1 flex flex-col bg-gray-50 rounded-lg p-4">
            <div className="flex-1 overflow-auto flex items-center justify-center">
              {imageUrl && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={force1to1 ? 1 : undefined}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Para edição"
                    onLoad={onImageLoad}
                    style={imageStyle}
                    className="max-w-full max-h-full"
                  />
                </ReactCrop>
              )}
            </div>
          </div>

          {/* Painel de Controles */}
          <div className="w-80 flex flex-col gap-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      Proporção
                    </span>
                    <Button
                      size="sm"
                      variant={force1to1 ? "default" : "outline"}
                      onClick={toggleAspectRatio}
                    >
                      1:1
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="h-4 w-4" />
                    <span className="text-sm font-medium">Brilho</span>
                    <Badge variant="outline">{brightness[0]}%</Badge>
                  </div>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Contrast className="h-4 w-4" />
                    <span className="text-sm font-medium">Contraste</span>
                    <Badge variant="outline">{contrast[0]}%</Badge>
                  </div>
                  <Slider
                    value={contrast}
                    onValueChange={setContrast}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ZoomIn className="h-4 w-4" />
                    <span className="text-sm font-medium">Zoom</span>
                    <Badge variant="outline">{zoom[0]}%</Badge>
                  </div>
                  <Slider
                    value={zoom}
                    onValueChange={setZoom}
                    min={50}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAdjustments}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </CardContent>
            </Card>

            {/* Informações da Imagem */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Informações</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Nome: {file.name}</div>
                  <div>Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div>Tipo: {file.type}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Salvar Edição
          </Button>
        </div>

        {/* Canvas oculto para renderização */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
