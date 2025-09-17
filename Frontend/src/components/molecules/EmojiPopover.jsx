import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/atoms/Button";
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";

export function EmojiPopover({ onSelect }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-2">
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0">
        <EmojiPicker
          onEmojiClick={(emojiData) => onSelect(emojiData.emoji)}
          searchDisabled={false}
          skinTonesDisabled={false}
        />
      </PopoverContent>
    </Popover>
  );
}
