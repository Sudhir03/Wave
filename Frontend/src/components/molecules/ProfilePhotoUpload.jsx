import React, { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Pencil } from "lucide-react";

export function ProfilePhotoUpload({ src, alt = "Profile", onEdit }) {
  const [preview, setPreview] = useState(src);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Update avatar preview
        if (onEdit) onEdit(file); // Optional callback with selected file
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  return (
    <div className="relative w-20 h-20">
      <Avatar className="w-20 h-20">
        <AvatarImage src={preview} alt={alt} />
        <AvatarFallback>{alt[0]}</AvatarFallback>
      </Avatar>

      {/* Pencil Icon Overlay */}
      <button
        type="button"
        onClick={handleClick}
        className=" cursor-pointer absolute bottom-0 right-0 p-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
