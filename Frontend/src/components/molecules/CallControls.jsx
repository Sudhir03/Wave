import { Mic, PhoneOff, Video, MoreVertical } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";

export const CallControls = ({ onEnd }) => (
  <div className="flex items-center justify-center gap-4 p-4">
    <IconButton icon={Mic} />
    <IconButton icon={Video} />
    <IconButton icon={MoreVertical} />
    <IconButton
      icon={PhoneOff}
      className="bg-destructive hover:bg-red-600 text-white"
      onClick={onEnd}
    />
  </div>
);
