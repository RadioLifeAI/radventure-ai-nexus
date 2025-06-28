
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  ChevronUp, 
  ChevronDown,
  RotateCcw,
  Maximize,
  Info,
  Activity,
  Timer
} from 'lucide-react';

interface MedicalImage {
  id: string;
  url: string;
  legend?: string;
  sequence_order: number;
}

interface MedicalStackViewerProps {
  images: MedicalImage[];
  className?: string;
  onImageChange?: (index: number) => void;
}

export function MedicalStackViewer({ 
  images, 
  className = "",
  onImageChange 
}: MedicalStackViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState([500]); // ms
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageStats, setImageStats] = useState<{width: number, height: number} | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Ordenar imagens por sequence_order
  const sortedImages = [...images].sort((a, b) => a.sequence_order - b.sequence_order);
  const currentImage = sortedImages[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && sortedImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % sortedImages.length);
      }, playSpeed[0]);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playSpeed, sortedImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentIndex, sortedImages.length]);

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % sortedImages.length;
    setCurrentIndex(nextIndex);
    onImageChange?.(nextIndex);
  }, [currentIndex, sortedImages.length, onImageChange]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? sortedImages.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onImageChange?.(prevIndex);
  }, [currentIndex, sortedImages.length, onImageChange]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetToFirst = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    onImageChange?.(0);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageStats({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  if (sortedImages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma imagem disponível para visualização em pilha</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}
    >
      {/* Header com controles */}
      <div className={`flex items-center justify-between p-4 ${
        isFullscreen ? 'bg-black/80 text-white' : 'bg-white border-b'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Stack Médico</span>
            <Badge variant="secondary">
              {currentIndex + 1}/{sortedImages.length}
            </Badge>
          </div>
          
          {sortedImages.length > 1 && (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={goToPrevious}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant={isPlaying ? "default" : "outline"}
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={goToNext}>
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={resetToFirst}>
                <SkipBack className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {sortedImages.length > 1 && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="text-sm">Velocidade:</span>
              <div className="w-20">
                <Slider
                  value={playSpeed}
                  onValueChange={setPlaySpeed}
                  min={100}
                  max={2000}
                  step={100}
                  className="w-full"
                />
              </div>
              <span className="text-xs">{playSpeed[0]}ms</span>
            </div>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área da imagem */}
      <div className={`relative ${isFullscreen ? 'flex-1' : 'h-96'} bg-gray-900 flex items-center justify-center`}>
        {currentImage && (
          <>
            <img
              src={currentImage.url}
              alt={`Imagem ${currentIndex + 1} - ${currentImage.legend || 'Sem legenda'}`}
              className="max-w-full max-h-full object-contain"
              onLoad={handleImageLoad}
            />
            
            {/* Indicador de posição */}
            {sortedImages.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {sortedImages.length}
              </div>
            )}
            
            {/* Progress bar */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="w-full bg-black/30 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / sortedImages.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Informações da imagem */}
      <div className={`p-4 border-t ${isFullscreen ? 'bg-black/80 text-white' : 'bg-gray-50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {currentImage?.legend && (
              <p className="font-medium mb-1">{currentImage.legend}</p>
            )}
            <div className="flex items-center gap-4 text-sm opacity-75">
              <span>Sequência: {currentImage?.sequence_order}</span>
              {imageStats && (
                <span>{imageStats.width} × {imageStats.height}px</span>
              )}
              <span>Tipo: Imagem médica</span>
            </div>
          </div>
          
          {isFullscreen && (
            <div className="text-xs opacity-60">
              <p>Use ↑↓ ou ←→ para navegar</p>
              <p>Espaço para play/pause • Esc para sair</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
