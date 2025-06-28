
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize, 
  Minimize,
  ChevronLeft, 
  ChevronRight,
  Move,
  Search,
  FolderTree
} from "lucide-react";
import { SpecializedCaseImage } from "@/hooks/useSpecializedCaseImages";

interface SpecializedImageViewerProps {
  images: SpecializedCaseImage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export function SpecializedImageViewer({ 
  images, 
  currentIndex, 
  onIndexChange, 
  className = "" 
}: SpecializedImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];
  const imageUrl = currentImage?.original_url;
  const imageLegend = currentImage?.legend;

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      e.preventDefault();
    }
  }, [zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }

    // Magnifier logic
    if (showMagnifier && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setMagnifierPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [isDragging, zoom, showMagnifier]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    if (!isFullscreen) {
      handleReset();
    }
  }, [isFullscreen, handleReset]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          if (currentIndex > 0) onIndexChange(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) onIndexChange(currentIndex + 1);
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentIndex, images.length, onIndexChange, handleZoomIn, handleZoomOut, handleReset]);

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
      handleReset();
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
      handleReset();
    }
  };

  return (
    <div 
      className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}
      ref={containerRef}
    >
      {/* Header Controls */}
      <div className={`flex items-center justify-between p-4 ${
        isFullscreen ? 'bg-black/80 text-white' : 'bg-white border-b'
      }`}>
        <div className="flex items-center gap-3">
          <h3 className="font-semibold flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-green-600" />
            Imagem Especializada
            {images.length > 1 && (
              <Badge variant="secondary">
                {currentIndex + 1}/{images.length}
              </Badge>
            )}
          </h3>
          
          {/* Mostrar organização especializada */}
          {currentImage?.specialty_code && currentImage?.modality_prefix && (
            <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
              {currentImage.specialty_code}/{currentImage.modality_prefix}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextImage}
                disabled={currentIndex === images.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Zoom Controls */}
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.25}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono px-2">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 5}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          {/* Reset */}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {/* Magnifier Toggle */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMagnifier(!showMagnifier)}
            className={showMagnifier ? 'bg-blue-100' : ''}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Fullscreen */}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Image Container */}
      <div className={`relative overflow-hidden bg-gray-100 ${
        isFullscreen ? 'flex-1' : 'h-96'
      }`}>
        <div
          className="w-full h-full flex items-center justify-center cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageUrl ? (
            <img
              ref={imageRef}
              src={imageUrl}
              alt={`Imagem médica especializada ${currentIndex + 1}`}
              className="max-w-none transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onDragStart={(e) => e.preventDefault()}
            />
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🏥</div>
              <p>Nenhuma imagem disponível</p>
            </div>
          )}
        </div>

        {/* Magnifier */}
        {showMagnifier && imageUrl && (
          <div 
            className="absolute pointer-events-none border-2 border-white shadow-lg"
            style={{
              left: magnifierPos.x - 50,
              top: magnifierPos.y - 50,
              width: 100,
              height: 100,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${zoom * 200}% ${zoom * 200}%`,
              backgroundPosition: `-${magnifierPos.x * zoom * 2 - 50}px -${magnifierPos.y * zoom * 2 - 50}px`,
              borderRadius: '50%',
              zIndex: 10
            }}
          />
        )}
      </div>

      {/* Image Legend */}
      {imageLegend && (
        <div className={`p-3 border-t ${
          isFullscreen ? 'bg-black/80 text-white' : 'bg-blue-50 border-blue-200'
        }`}>
          <p className="text-sm font-medium">{imageLegend}</p>
        </div>
      )}

      {/* Organization Info */}
      {currentImage?.bucket_path && (
        <div className={`p-2 text-xs ${
          isFullscreen ? 'bg-black/60 text-gray-300' : 'bg-green-50 text-green-700'
        }`}>
          <p>📁 Organização: {currentImage.bucket_path}</p>
        </div>
      )}

      {/* Fullscreen Help */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs rounded px-3 py-2">
          <p>Atalhos: ← → (navegar) | + - (zoom) | 0 (reset) | Esc (sair)</p>
        </div>
      )}
    </div>
  );
}
