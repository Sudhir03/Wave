import React, { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Pencil } from "lucide-react";

export function ProfilePhotoUpload({
  src,
  alt = "Profile",
  onEdit,
  isUploading,
  name,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onEdit?.(file);
  };

  return (
    <div className="relative">
      {/* Actual Avatar */}
      <Avatar className="w-20 h-20">
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{name?.charAt[0]}</AvatarFallback>
      </Avatar>

      {/* Upload button */}
      {!isUploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer absolute bottom-0 right-0 p-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
