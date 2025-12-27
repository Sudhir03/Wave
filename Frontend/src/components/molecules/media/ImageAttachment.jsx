import { Upload } from "lucide-react";

export function ImageAttachment({
  url,
  isUploading,
  onClick,
  showRemaining,
  remaining,
}) {
  return (
    <div
      className="relative w-16 h-16 rounded overflow-hidden flex items-center justify-center
        bg-[theme('colors.bg')] dark:bg-[theme('colors.bg-dark')] cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={url}
        alt="Shared Image"
        className="w-full h-full object-cover rounded"
      />

      {/* Upload overlay */}
      {isUploading && (
        <div
          className="absolute inset-0 flex items-center justify-center
          bg-black/40 rounded"
        >
          <Upload className="w-5 h-5 text-white animate-pulse" />
        </div>
      )}

      {/* Remaining count */}
      {showRemaining && remaining > 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded
            bg-black/60 text-white text-sm font-medium"
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
