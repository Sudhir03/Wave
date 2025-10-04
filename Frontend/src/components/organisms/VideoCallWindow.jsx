import { CallControls } from "@/components/molecules/CallControls";
import { Avatar, AvatarFallback } from "@/components/atoms/Avatar";

export const VideoCallWindow = ({
  callerName,
  localVideoSrc,
  remoteVideoSrc,
  onEnd,
}) => (
  <div className="relative w-full h-full bg-black text-white overflow-hidden z-51">
    {/* Top bar */}
    <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-black/50 backdrop-blur-sm z-20">
      <span className="font-semibold text-lg">{callerName}</span>
      <span className="text-xs text-gray-300">In Call</span>
    </div>

    {/* Remote video (full screen) */}
    <div className="w-full h-full relative flex items-center justify-center">
      <video
        src={remoteVideoSrc}
        autoPlay
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* Local video (picture-in-picture) */}
      <div className="absolute bottom-6 right-6 w-40 h-40 rounded-xl overflow-hidden border-2 border-white shadow-lg">
        {localVideoSrc ? (
          <video
            src={localVideoSrc}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <Avatar className="w-full h-full rounded-none">
            <AvatarFallback className="bg-gray-700 text-white text-lg font-medium">
              {callerName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>

    {/* Call controls */}
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <CallControls onEnd={onEnd} type="video" />
    </div>
  </div>
);
