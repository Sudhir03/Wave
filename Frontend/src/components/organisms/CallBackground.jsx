import { Avatar, AvatarFallback, AvatarImage } from "../atoms/Avatar";

export const CallBackground = ({
  peer,
  isVideo,
  callState,
  hasLocalStream,
  hasRemoteStream,
  localVideoRef,
  remoteVideoRef,
}) => {
  /* ================= AUDIO CALL ================= */
  if (!isVideo) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-neutral-900 to-black text-white">
        <Avatar className="h-36 w-36 border-4 border-white/10 shadow-2xl">
          <AvatarImage src={peer?.avatar} />
          <AvatarFallback className="bg-slate-700 text-3xl font-semibold">
            {peer?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <h2 className="mt-6 text-2xl font-semibold tracking-wide">
          {peer?.name}
        </h2>

        <p className="mt-2 text-xs tracking-wide text-slate-400">
          {callState === "incoming" ? "Incoming call" : callState}
        </p>
      </div>
    );
  }

  /* ================= VIDEO CALL (PiP) ================= */
  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* 🌍 Remote Video – Fullscreen */}
      {hasRemoteStream && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 🧍 Local Video – PiP */}
      {hasLocalStream && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`
            absolute 
            bottom-4 right-4
            w-36 h-48 sm:w-44 sm:h-60
            object-cover
            rounded-xl
            border border-white/20
            shadow-2xl
            bg-black
          `}
        />
      )}

      {/* ⏳ Connecting fallback */}
      {!hasLocalStream && !hasRemoteStream && (
        <div className="absolute inset-0 flex items-center justify-center text-sm opacity-70 text-white">
          Connecting…
        </div>
      )}
    </div>
  );
};
