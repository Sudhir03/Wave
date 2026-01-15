import { Avatar, AvatarFallback, AvatarImage } from "../atoms/Avatar";

const AvatarWithPulse = ({ peer, pulse = false, size = "lg" }) => {
  const sizeMap = {
    sm: "h-24 w-24 text-2xl",
    md: "h-32 w-32 text-3xl",
    lg: "h-36 w-36 text-3xl",
  };

  return (
    <div className="relative flex items-center justify-center">
      {pulse && (
        <span className="absolute inset-0 rounded-full animate-ping bg-accent/40" />
      )}

      <Avatar
        className={`relative border-4 border-white/10 shadow-2xl ${sizeMap[size]}`}
      >
        <AvatarImage src={peer?.avatar} />
        <AvatarFallback className="bg-slate-700 font-semibold">
          {peer?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export const CallBackground = ({
  peer,
  isVideo,
  callState,
  hasLocalStream,
  hasRemoteStream,
  isCameraOn,
  peerCameraOn = true,
  localVideoRef,
  remoteVideoRef,

  // 🔥 NEW
  busyReason,
}) => {
  const isBusy = callState === "busy";

  // ✅ ONLY calling + ringing
  const isLocalPreviewPhase =
    callState === "calling" || callState === "ringing";

  const showPulse =
    isBusy ||
    (!isVideo && callState !== "connected") ||
    isLocalPreviewPhase ||
    callState === "incoming";

  const showAvatar =
    isBusy || !isVideo || !peerCameraOn || callState === "incoming";

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* ================= FULLSCREEN VIDEO ================= */}
      {isVideo && !isBusy && (
        <video
          ref={
            callState === "connected" && hasRemoteStream && peerCameraOn
              ? remoteVideoRef
              : isLocalPreviewPhase
              ? localVideoRef
              : null
          }
          autoPlay
          muted={callState !== "connected"} // 🔇 local preview muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover ${
            (!isLocalPreviewPhase && callState !== "connected") ||
            (!isCameraOn && isLocalPreviewPhase) ||
            (callState === "connected" && !peerCameraOn)
              ? "hidden"
              : ""
          }`}
        />
      )}

      {/* ================= AVATAR UI ================= */}
      {showAvatar && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-neutral-900 to-black">
          <AvatarWithPulse peer={peer} pulse={showPulse} />

          <h2 className="mt-6 text-2xl font-semibold">{peer?.name}</h2>

          <p className="mt-2 text-sm text-slate-400">
            {isBusy
              ? "Call unavailable"
              : !isVideo
              ? "Audio call"
              : "Video call"}
          </p>

          <p
            className={`mt-2 text-xs tracking-wide ${
              isBusy ? "text-red-400" : "text-slate-400"
            }`}
          >
            {isBusy
              ? busyReason || "User is busy on another call"
              : callState === "incoming"
              ? "Incoming call"
              : callState}
          </p>
        </div>
      )}

      {/* ================= LOCAL VIDEO PiP ================= */}
      {callState === "connected" &&
        hasLocalStream &&
        isCameraOn &&
        isVideo &&
        hasRemoteStream && (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute bottom-4 right-4 w-36 h-48 rounded-xl object-cover border border-white/20"
          />
        )}
    </div>
  );
};
