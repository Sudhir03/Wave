import { Play, Pause, Upload } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useState, useRef, useEffect } from "react";
import { formatFileSize } from "@/lib/utils";

export function AudioPlayer({
  fileName,
  fileSize,
  audioUrl,
  isActive,
  onPlay,
  isUploading,
  isMine,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (!isActive && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlayPause = () => {
    if (isUploading) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      onPlay?.();
      audio.play();
    } else {
      audio.pause();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    if (isUploading) return;

    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`
        relative
        flex items-center gap-3
        p-3
        bg-blue-50
        rounded-lg
        border border-blue-100

        w-full
        max-w-[90%]
        sm:max-w-sm

        ${isMine ? "ml-auto" : "mr-auto"}
      `}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <Button
        variant="ghost"
        size="sm"
        disabled={isUploading}
        className="relative w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 rounded-lg"
        onClick={togglePlayPause}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}

        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <Upload className="w-4 h-4 text-white animate-pulse" />
          </span>
        )}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate mb-1">{fileName}</div>

        <div
          className="w-full h-1 bg-gray-200 rounded-full cursor-pointer mb-1"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span>{formatFileSize(fileSize)}</span>
        </div>
      </div>
    </div>
  );
}
