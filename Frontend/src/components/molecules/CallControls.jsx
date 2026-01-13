import { IconButton } from "../atoms/IconButton";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCcw, // 🔁 switch call type
} from "lucide-react";

export const CallControls = ({
  isMicOn,
  isCameraOn,
  onEnd,
  type, // "audio" | "video"
  onToggleMic,
  onToggleCamera,
  onSwitchCamera,
  canSwitchCamera,
}) => {
  return (
    <div
      className="
    flex items-center justify-center
    gap-4 sm:gap-4 
    py-2 sm:py-2
    px-4 sm:px-4 
    rounded-3xl
    bg-gray-300
    flex-wrap sm:flex-nowrap
  "
    >
      {/* 🎤 Mic */}
      <IconButton icon={isMicOn ? Mic : MicOff} onClick={onToggleMic} />

      {/* 🎥 Camera (video only) */}
      {type === "video" && (
        <IconButton
          icon={isCameraOn ? Video : VideoOff}
          onClick={onToggleCamera}
        />
      )}

      {/* 🔄 Switch front/back camera */}
      {type === "video" && canSwitchCamera && isCameraOn && (
        <IconButton icon={RefreshCcw} onClick={onSwitchCamera} />
      )}

      {/* ❌ End */}
      <IconButton
        icon={PhoneOff}
        className="bg-destructive hover:bg-red-600 text-white"
        onClick={onEnd}
      />
    </div>
  );
};
