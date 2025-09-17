import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/atoms/Button";
import { Label } from "@/components/atoms/Label";
import { Input } from "../atoms/Input";
import { Paperclip, Headphones, FileTextIcon, ImageIcon } from "lucide-react";

export function MediaPickerPopover({ onSelect }) {
  const [open, setOpen] = useState(false);

  // Handles selection of multiple files (images/videos together)
  const handleMediaFiles = (files) => {
    if (!files || files.length === 0) return;

    const mediaFiles = Array.from(files).map((file, i) => ({
      id: Date.now() + i, // unique id
      file,
      type: file.type.startsWith("image") ? "image" : "video",
      src: URL.createObjectURL(file),
      thumbnail: file.type.startsWith("image")
        ? null
        : URL.createObjectURL(file),
    }));

    onSelect(mediaFiles);
    setOpen(false);
  };

  // Handles audio and documents separately
  const handleFile = (file, type) => {
    if (!file) return;
    onSelect([
      {
        id: Date.now(),
        file,
        type,
      },
    ]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-2">
          <Paperclip className="w-5 h-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-4 grid grid-cols-3 gap-4">
        {/* Images + Videos */}
        <Label className="flex flex-col items-center cursor-pointer gap-1">
          <div className="p-3 rounded-full bg-muted hover:bg-muted/80">
            <ImageIcon className="w-6 h-6" />
          </div>
          <span className="text-xs">Media</span>
          <Input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleMediaFiles(e.target.files)}
            className="hidden"
          />
        </Label>

        {/* Audio */}
        <Label className="flex flex-col items-center cursor-pointer gap-1">
          <div className="p-3 rounded-full bg-muted hover:bg-muted/80">
            <Headphones className="w-6 h-6" />
          </div>
          <span className="text-xs">Audio</span>
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFile(e.target.files[0], "audio")}
            className="hidden"
          />
        </Label>

        {/* Documents */}
        <Label className="flex flex-col items-center cursor-pointer gap-1">
          <div className="p-3 rounded-full bg-muted hover:bg-muted/80">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <span className="text-xs">Document</span>
          <Input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFile(e.target.files[0], "document")}
            className="hidden"
          />
        </Label>
      </PopoverContent>
    </Popover>
  );
}
