import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { Play, Pause, Upload } from "lucide-react";

export function VoicePlayer({ audioSrc, isUploading = false, isMine }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const waveformRef = useRef(
    Array.from({ length: 40 }, () => Math.random() * 60 + 20)
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    if (isUploading) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) audio.pause();
    else audio.play();

    setIsPlaying(!isPlaying);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div
      className={`
        relative
        flex items-center gap-3
        p-3
        bg-gray-100 dark:bg-gray-800
        rounded-2xl

        w-full
        max-w-[70%]
        sm:max-w-md

        ${isMine ? "ml-auto" : "mr-auto"}
      `}
    >
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Play / Pause */}
      <Button
        size="sm"
        onClick={togglePlay}
        disabled={isUploading}
        className="relative w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white p-0 shrink-0"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}

        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
            <Upload className="w-4 h-4 text-white animate-pulse" />
          </span>
        )}
      </Button>

      {/* Waveform */}
      <div className="flex items-end gap-[3px] flex-1 h-8 overflow-hidden">
        {waveformRef.current.map((h, i) => {
          const active = i / waveformRef.current.length < progress;
          return (
            <div
              key={i}
              className={`w-[3px] rounded-full ${
                active ? "bg-blue-500" : "bg-blue-200 dark:bg-blue-300"
              }`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
