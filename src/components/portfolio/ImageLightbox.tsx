import { useState, useEffect, useRef, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

interface ImageLightboxProps {
  images: { url: string; title: string; description?: string | null }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightbox = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Animate in when opening
  useEffect(() => {
    if (isOpen && overlayRef.current && imageRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        imageRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
      );
    }
  }, [isOpen, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          navigatePrev();
          break;
        case "ArrowRight":
          navigateNext();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const navigatePrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const navigateNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % images.length;
    onNavigate(newIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Touch gestures for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1) return; // Disable swipe when zoomed
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || zoom > 1) return;
    // Prevent default to avoid scroll
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || zoom > 1) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        navigatePrev();
      } else {
        navigateNext();
      }
    }

    setTouchStart(null);
  };

  // Mouse drag for zoomed images
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    if (overlayRef.current && imageRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
      });
      gsap.to(imageRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="bg-background/20 backdrop-blur-sm hover:bg-background/40 text-white"
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        <span className="text-white/80 text-sm font-medium min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="bg-background/20 backdrop-blur-sm hover:bg-background/40 text-white"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-background/20 backdrop-blur-sm hover:bg-background/40 text-white"
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-background/20 backdrop-blur-sm hover:bg-background/40 text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-50">
        <span className="text-white/80 text-sm font-medium bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={navigatePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 flex items-center justify-center transition-all hover:scale-110 text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={navigateNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40 flex items-center justify-center transition-all hover:scale-110 text-white"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image container */}
      <div
        className="relative z-40 max-w-[90vw] max-h-[85vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
      >
        <img
          ref={imageRef}
          src={currentImage.url}
          alt={currentImage.title}
          loading="lazy"
          className="max-w-full max-h-[85vh] object-contain select-none transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Image info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-center max-w-lg px-4">
        <h3 className="text-white font-semibold text-lg">{currentImage.title}</h3>
        {currentImage.description && (
          <p className="text-white/70 text-sm mt-1 line-clamp-2">
            {currentImage.description}
          </p>
        )}
      </div>

      {/* Swipe hint on mobile */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <p className="text-white/50 text-xs">Swipe to navigate</p>
      </div>
    </div>
  );
};
