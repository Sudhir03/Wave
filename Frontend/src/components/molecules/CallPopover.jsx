import { Phone, Video } from "lucide-react";
import { useWebRTC } from "@/features/webrtc/CallContext";

export const CallPopover = ({ type, peer }) => {
  const { startCall } = useWebRTC();
  const isAudio = type === "audio";
  const Icon = isAudio ? Phone : Video;
  const handleClick = () => {
    startCall({
      video: !isAudio,
      callee: {
        id: peer._id,
        name: peer.fullName,
        avatar: peer.profileImageUrl,
      },
    });
  };

  return (
    <button onClick={handleClick} className="p-2 cursor-pointer">
      <Icon className="w-5 h-5" />
    </button>
  );
};
