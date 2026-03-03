import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Share2, Heart } from "lucide-react";

interface PetImageHeaderProps {
  images: string[];
  isInWishlist: boolean;
  onBack: () => void;
  onShare: () => void;
  onWishlistToggle: () => void;
}

const PetImageHeader = ({ images, isInWishlist, onBack, onShare, onWishlistToggle }: PetImageHeaderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current || images.length <= 1) return;
    swiping.current = false;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) {
      setCurrentIndex(prev => (prev + 1) % images.length);
    } else {
      setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);

  return (
    <div
      className="relative w-full bg-[#F0F0F0]"
      style={{ minHeight: "280px", aspectRatio: "1/1" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {images.length > 0 ? (
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt="Pet"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground" style={{ minHeight: "280px" }}>
          No images
        </div>
      )}

      {/* Top nav icons */}
      <div className="absolute top-10 left-4 right-4 flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#E8E8E8]/90 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-[#444]" />
        </button>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onWishlistToggle}
            className="w-10 h-10 rounded-full bg-[#E8E8E8]/90 backdrop-blur-sm flex items-center justify-center"
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? "fill-destructive text-destructive" : "text-[#444]"}`} />
          </button>
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-full bg-[#E8E8E8]/90 backdrop-blur-sm flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-[#444]" />
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              className={`h-[6px] rounded-full transition-all ${i === currentIndex ? "w-5 bg-[#A855F7]" : "w-[6px] bg-[#D1D5DB]"}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PetImageHeader;
