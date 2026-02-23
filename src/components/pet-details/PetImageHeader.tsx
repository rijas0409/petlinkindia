import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, Share2, Heart } from "lucide-react";

interface PetImageHeaderProps {
  images: string[];
  isInWishlist: boolean;
  onBack: () => void;
  onShare: () => void;
  onWishlistToggle: () => void;
}

const PetImageHeader = ({ images, isInWishlist, onBack, onShare, onWishlistToggle }: PetImageHeaderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative w-full bg-[#F0F0F0]" style={{ minHeight: "280px", aspectRatio: "1/1" }}>
      {images.length > 0 ? (
        <img src={images[currentIndex]} alt="Pet" className="w-full h-full object-cover" />
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
          {/* Task F2: Use same heart icon style as home page header */}
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

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center"
            onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center"
            onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-[#FF4BCD]" : "bg-white/60"}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PetImageHeader;
