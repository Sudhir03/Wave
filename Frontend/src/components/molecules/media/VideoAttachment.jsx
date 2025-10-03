import { Play } from "lucide-react";

export function VideoAttachment({ poster, onClick, showRemaining, remaining }) {
  return (
    <div
      className="relative w-16 h-16 rounded overflow-hidden flex items-center justify-center
        bg-[theme('colors.bg')] dark:bg-[theme('colors.bg-dark')] cursor-pointer"
      onClick={onClick}
    >
      <img
        src={poster}
        alt="Video thumbnail"
        className="w-full h-full object-cover rounded"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="w-5 h-5 text-white opacity-80 pointer-events-none" />
      </div>

      {showRemaining && remaining > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded
            bg-muted text-muted-foreground text-sm font-medium cursor-pointer"
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
