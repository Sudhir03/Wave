import { IconButton } from "../atoms/IconButton";
import { Mic, MicOff, Video, VideoOff, Camera, PhoneOff } from "lucide-react";

export const CallControls = ({
  isMicOn,
  isCameraOn,
  onEnd,
  type,
  onToggleMic,
  onToggleCamera,
  onSwitchCamera,
  canSwitchCamera,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 py-2 px-4 rounded-3xl bg-gray-300">
      {/* 🎤 Mic */}
      <IconButton icon={isMicOn ? Mic : MicOff} onClick={onToggleMic} />

      {/* 🎥 Camera */}
      {type === "video" && (
        <IconButton
          icon={isCameraOn ? Video : VideoOff}
          onClick={onToggleCamera}
        />
      )}

      {/* 🔄 Switch camera */}
      {type === "video" && canSwitchCamera && isCameraOn && (
        <IconButton icon={Camera} onClick={onSwitchCamera} />
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
