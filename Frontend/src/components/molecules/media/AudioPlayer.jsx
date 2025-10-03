import { Play, Pause } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { useState, useRef, useEffect } from "react";

export function AudioPlayer({
  fileName,
  fileSize,
  audioUrl,
  isActive,
  onPlay,
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

  // Pause if not active
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isActive && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      onPlay?.(); // Notify parent to make this active
      audio.play();
    } else {
      audio.pause();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 max-w-sm">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="sm"
        className="flex-shrink-0 w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 rounded-lg"
        onClick={togglePlayPause}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </Button>

      {/* Audio Info and Progress */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate mb-1">
          {fileName}
        </div>

        {/* Progress Bar */}
        <div
          className="w-full h-1 bg-gray-200 rounded-full cursor-pointer mb-1"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time and Size */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span>{fileSize}</span>
        </div>
      </div>
    </div>
  );
}
