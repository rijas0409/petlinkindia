import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Share2, Heart, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface PetImageHeaderProps {
  media: MediaItem[];
  isInWishlist: boolean;
  onBack: () => void;
  onShare: () => void;
  onWishlistToggle: () => void;
}

const PetImageHeader = ({ media, isInWishlist, onBack, onShare, onWishlistToggle }: PetImageHeaderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState("");
  const [videoError, setVideoError] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const swiping = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload images
  useEffect(() => {
    media.filter(m => m.type === 'image').forEach(m => {
      const img = new Image();
      img.src = m.url;
    });
  }, [media]);

  // Auto-pause video when swiping away
  useEffect(() => {
    if (media[currentIndex]?.type !== 'video' && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentIndex, media]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    swiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current || media.length <= 1) return;
    swiping.current = false;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) < 50) return;
    if (diff > 0) {
      setCurrentIndex(prev => (prev + 1) % media.length);
    } else {
      setCurrentIndex(prev => (prev - 1 + media.length) % media.length);
    }
  }, [media.length]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      resetControlsTimer();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(progress);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    const mins = Math.floor(dur / 60);
    const secs = Math.floor(dur % 60);
    setVideoDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.type === 'video';

  return (
    <div
      className="relative w-full bg-[#F0F0F0] overflow-hidden"
      style={{ aspectRatio: "4/5", animation: "fadeIn 0.2s ease-out", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {media.length > 0 ? (
        isVideo && !videoError ? (
          <div className="w-full h-full relative" onClick={() => { resetControlsTimer(); }}>
            <video
              ref={videoRef}
              src={currentMedia.url}
              className="w-full h-full object-cover"
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => { setIsPlaying(false); setShowControls(true); }}
              onError={() => setVideoError(true)}
            />
            {/* Duration badge */}
            {videoDuration && !isPlaying && (
              <div className="absolute top-14 right-4 px-2 py-0.5 rounded-full bg-black/50 text-white text-[11px] font-medium">
                {videoDuration}
              </div>
            )}
            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            {/* Play button overlay */}
            {!isPlaying && (
              <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg" style={{ boxShadow: "0 0 20px rgba(244,114,182,0.3)" }}>
                  <Play className="w-7 h-7 text-[#333] ml-1" fill="#333" />
                </div>
              </button>
            )}
            {/* Video controls */}
            {isPlaying && showControls && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 z-10" style={{ animation: "fadeIn 0.15s ease-out" }}>
                <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                  <Pause className="w-4 h-4 text-white" />
                </button>
                <div className="flex-1 h-[3px] bg-white/30 rounded-full cursor-pointer" onClick={handleSeek}>
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${videoProgress}%` }} />
                </div>
                <button onClick={toggleMute} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
                <button onClick={handleFullscreen} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        ) : isVideo && videoError ? (
          <div className="w-full h-full flex items-center justify-center bg-[#E5E7EB]">
            <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center">
              <Play className="w-7 h-7 text-[#999] ml-1" />
            </div>
          </div>
        ) : (
          <img
            key={currentIndex}
            src={currentMedia.url}
            alt="Pet"
            className="w-full h-full object-cover"
            style={{ animation: "fadeIn 0.15s ease-out" }}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          No images
        </div>
      )}

      {/* Image counter */}
      {media.length > 1 && (
        <div className="absolute top-14 right-4 px-2.5 py-1 rounded-full bg-black/40 text-white text-[11px] font-semibold z-10">
          {currentIndex + 1}/{media.length}
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
      {media.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {media.map((_, i) => (
            <button
              key={i}
              className={`h-[6px] rounded-full transition-all duration-200 ${i === currentIndex ? "w-5" : "w-[6px] bg-[#D1D5DB]/60"}`}
              style={i === currentIndex ? { background: "linear-gradient(90deg, #FF4D6D, #A855F7)" } : {}}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PetImageHeader;
