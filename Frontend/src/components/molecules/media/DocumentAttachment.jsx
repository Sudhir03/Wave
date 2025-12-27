import { formatFileSize } from "@/lib/utils";
import { FileText, Upload } from "lucide-react";

export function DocumentAttachment({ fileName, fileSize, url, isUploading }) {
  const handleClick = () => {
    if (isUploading) return;
    if (!url) return;

    window.open(
      `https://docs.google.com/gview?url=${encodeURIComponent(
        url
      )}&embedded=true`,
      "_blank"
    );
  };

  return (
    <div
      onClick={handleClick}
      className="relative flex items-center gap-3 p-3 rounded-lg border
        bg-blue-50 hover:bg-blue-100 cursor-pointer max-w-xs"
    >
      {/* Icon container */}
      <div
        className="relative shrink-0 w-10 h-10 bg-blue-500 rounded-lg
        flex items-center justify-center overflow-hidden"
      >
        <FileText className="w-5 h-5 text-white" />

        {/* Upload overlay */}
        {isUploading && (
          <div
            className="absolute inset-0 flex items-center justify-center
            bg-black/60"
          >
            <Upload className="w-4 h-4 text-white animate-pulse" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{fileName}</div>
        <div className="text-xs text-gray-500">{formatFileSize(fileSize)}</div>
      </div>
    </div>
  );
}
