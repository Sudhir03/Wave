import { Play, Upload } from "lucide-react";

export function VideoAttachment({
  thumbnail,
  isUploading,
  onClick,
  showRemaining,
  remaining,
}) {
  return (
    <div
      onClick={onClick}
      className="relative w-16 h-16 rounded overflow-hidden
        flex items-center justify-center cursor-pointer
        bg-black"
    >
      {/* Thumbnail ONLY when NOT uploading */}
      {!isUploading && thumbnail && (
        <img
          src={thumbnail}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Uploading state → ignore thumbnail completely */}
      {isUploading && (
        <div
          className="absolute inset-0 flex items-center justify-center
          bg-black"
        >
          <Upload className="w-5 h-5 text-white animate-pulse" />
        </div>
      )}

      {/* Play icon AFTER upload */}
      {!isUploading && thumbnail && (
        <Play className="absolute w-5 h-5 text-white opacity-80 pointer-events-none" />
      )}

      {/* Remaining count */}
      {showRemaining && remaining > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center
          bg-black/70 text-white text-sm font-medium"
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
