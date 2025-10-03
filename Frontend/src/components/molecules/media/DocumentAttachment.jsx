import { FileText } from "lucide-react";

export function DocumentAttachment({ fileName, fileSize, url }) {
  const handleClick = () => {
    console.log("meow", url);
    if (!url) return;
    window.open(url, "_blank"); // Open in new tab
  };

  return (
    <div
      className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 cursor-pointer transition-colors max-w-xs"
      onClick={handleClick}
    >
      {/* Document Icon */}
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
        <FileText className="w-5 h-5 text-white" />
      </div>

      {/* Document Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {fileName}
        </div>
        <div className="text-xs text-gray-500">{fileSize}</div>
      </div>
    </div>
  );
}
