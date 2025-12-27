import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

export function MediaGallery({ media, initialIndex, isOpen, setIsOpen }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const currentMedia = media[currentIndex];

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Reset on index change
  useEffect(() => {
    setProgress(0);
    setIsPlaying(false);
  }, [currentIndex, isOpen]);

  // Video progress tracking
  useEffect(() => {
    const el = videoRef.current;
    if (!el || currentMedia.type !== "video") return;

    const updateProgress = () => {
      if (el.duration) setProgress((el.currentTime / el.duration) * 100);
    };
    const handleEnded = () => setIsPlaying(false);

    el.addEventListener("timeupdate", updateProgress);
    el.addEventListener("loadedmetadata", updateProgress);
    el.addEventListener("ended", handleEnded);

    return () => {
      el.removeEventListener("timeupdate", updateProgress);
      el.removeEventListener("loadedmetadata", updateProgress);
      el.removeEventListener("ended", handleEnded);
    };
  }, [currentMedia.id]);

  // Swipe support
  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e) => (startX = e.touches[0].clientX);
    const handleTouchEnd = (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) diff < 0 ? nextMedia() : prevMedia();
    };
    const container = containerRef.current;
    container?.addEventListener("touchstart", handleTouchStart);
    container?.addEventListener("touchend", handleTouchEnd);
    return () => {
      container?.removeEventListener("touchstart", handleTouchStart);
      container?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentIndex]);

  const nextMedia = () => setCurrentIndex((prev) => (prev + 1) % media.length);
  const prevMedia = () =>
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play();
    else el.pause();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e) => {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    el.currentTime = (clickX / rect.width) * el.duration;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
    >
      {/* Close button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main media area */}
      <div className="flex-1 relative flex items-center justify-center p-4 pb-32">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMedia}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMedia}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        <div className="relative flex items-center justify-center max-w-4xl w-full h-[70vh] bg-transparent rounded-md">
          {currentMedia.type === "image" && (
            <img
              src={currentMedia.url}
              alt="Shared Media"
              className="max-w-full max-h-[85vh] object-contain"
            />
          )}
          {currentMedia.type === "video" && (
            <video
              key={currentMedia.id}
              ref={videoRef}
              src={currentMedia.url}
              muted={isMuted}
              className="max-w-full max-h-[85vh] object-contain cursor-pointer"
              onClick={togglePlay}
            />
          )}
        </div>
      </div>

      {/* Video controls + thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center p-1">
        {currentMedia.type === "video" && (
          <div className="w-full max-w-4xl mb-1 bg-gray-900/80 p-2 rounded flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <span className="text-white text-xs min-w-10">
              {formatTime(videoRef.current?.currentTime || 0)}
            </span>

            <div
              className="flex-1 h-2 bg-gray-700 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-white text-xs min-w-10">
              {formatTime(videoRef.current?.duration || 0)}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>
        )}

        {/* Thumbnails */}
        <div className="w-full max-w-4xl flex gap-2 overflow-x-auto no-scrollbar">
          {media.map((item, index) => (
            <div
              key={item._id}
              onClick={() => setCurrentIndex(index)}
              className={`relative shrink-0 cursor-pointer transition-all duration-200 hover:opacity-80 ${
                index === currentIndex ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <div className="w-12 h-12 bg-background rounded-xs flex items-center justify-center overflow-hidden">
                <img
                  src={item.thumbnail || "/placeholder.svg"}
                  alt="Media Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 p-1 rounded-full">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
