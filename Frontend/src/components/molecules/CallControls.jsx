import { useState } from "react";
import { Mic, MicOff, PhoneOff, Video, Phone } from "lucide-react";
import { IconButton } from "@/components/atoms/IconButton";

export const CallControls = ({ onEnd, type, onToggleType }) => {
  const [micOn, setMicOn] = useState(true);

  return (
    <div className="flex items-center justify-center gap-4 py-2 px-4 rounded-3xl  bg-gray-300">
      {/* Mic toggle */}
      <IconButton
        icon={micOn ? Mic : MicOff}
        onClick={() => setMicOn(!micOn)}
      />
      {/* Video ↔ Voice toggle */}
      {type === "video" ? (
        <IconButton icon={Phone} onClick={() => onToggleType?.("voice")} />
      ) : (
        <IconButton icon={Video} onClick={() => onToggleType?.("video")} />
      )}
      {/* End call */}
      <IconButton
        icon={PhoneOff}
        className="bg-destructive hover:bg-red-600 text-white"
        onClick={onEnd}
      />
    </div>
  );
};
