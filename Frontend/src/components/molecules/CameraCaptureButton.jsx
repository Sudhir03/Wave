import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Camera } from "lucide-react";

export function CameraCaptureButton({ onSelect }) {
  return (
    <>
      <Input
        id="camera-input"
        type="file"
        accept="image/*,video/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (!files.length) return;

          const mediaItems = files.map((file) => {
            const url = URL.createObjectURL(file);

            const type = file.type.startsWith("image/")
              ? "image"
              : file.type.startsWith("video/")
              ? "video"
              : "document";

            return {
              id: crypto.randomUUID(),
              type,
              file,
              url,
              thumbnail: url,
              fileName: file.name,
              fileSize: file.size,
            };
          });

          onSelect(mediaItems);
          e.target.value = "";
        }}
      />

      <Label htmlFor="camera-input">
        <Button variant="ghost" className="p-2" asChild>
          <span>
            <Camera className="w-5 h-5" />
          </span>
        </Button>
      </Label>
    </>
  );
}
