import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, Share2, Heart } from "lucide-react";

interface PetImageHeaderProps {
  images: string[];
  isInWishlist: boolean;
  onBack: () => void;
  onShare: () => void;
  onWishlistToggle: () => void;
  badges: { label: string; color: string }[];
}

const PetImageHeader = ({ images, isInWishlist, onBack, onShare, onWishlistToggle, badges }: PetImageHeaderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative w-full aspect-[4/5] bg-muted">
      {images.length > 0 ? (
        <img src={images[currentIndex]} alt="Pet" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No images</div>
      )}

      {/* Floating top icons */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={onWishlistToggle}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md"
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>
        </div>
      </div>

      {/* Image navigation arrows */}
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
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? "bg-primary" : "bg-white/60"}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}

      {/* Bottom badges */}
      {badges.length > 0 && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          {badges.map((b, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: b.color }}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetImageHeader;
