import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { Play, Pause } from "lucide-react";

export function VoicePlayer({ audioSrc }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.random() * 100 + 20; // Random height between 20-120%
    // Calculate progress based on current time and duration
    const progress = duration > 0 ? currentTime / duration : 0;
    const isActive = i < progress * 40;
    return { height, isActive };
  });

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

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleWaveformClick = (index) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (index / (waveformBars.length - 1)) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="flex items-start gap-3 p-4 max-w-md">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
          <Button
            size="sm"
            className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white p-0 flex-shrink-0"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          <div className="flex items-end gap-0.5 flex-1 h-8 cursor-pointer group">
            {waveformBars.map((bar, index) => (
              <div
                key={index}
                className={`w-1 rounded-full transition-all duration-150 hover:opacity-80 ${
                  bar.isActive
                    ? "bg-blue-500"
                    : "bg-blue-200 dark:bg-blue-300 hover:bg-blue-300 dark:hover:bg-blue-400"
                }`}
                style={{
                  height: `${Math.max(bar.height * 0.3, 8)}px`,
                  minHeight: "4px",
                }}
                onClick={() => handleWaveformClick(index)}
                title={`Seek to ${Math.round(
                  (index / (waveformBars.length - 1)) * 100
                )}%`}
              />
            ))}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioSrc} preload="metadata" />
    </div>
  );
}
