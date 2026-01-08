import { Avatar, AvatarFallback, AvatarImage } from "../atoms/Avatar";

export const CallBackground = ({
  peer,
  isVideo,
  callState, // still passed for future use
  hasLocalStream,
  hasRemoteStream,
  localVideoRef,
  remoteVideoRef,
}) => {
  /* ================= AUDIO CALL ================= */
  if (!isVideo) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-neutral-900 to-black text-white">
        {/* Avatar */}
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

        {/* Name */}
        <h2 className="mt-6 text-2xl font-semibold tracking-wide">
          {peer?.name}
        </h2>

        {/* Call status */}
        {callState === "incoming" && (
          <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
            Incoming call
          </p>
        )}

        {callState !== "incoming" && (
          <p className="mt-2 text-xs tracking-wide text-slate-400">Calling…</p>
        )}
      </div>
    );
  }

  /* ================= VIDEO CALL ================= */

  // 1️⃣ Remote available → REMOTE fullscreen
  if (hasRemoteStream) {
    return (
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  // 2️⃣ Remote nahi, local hai → LOCAL fullscreen
  if (hasLocalStream) {
    return (
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  // 3️⃣ No streams yet
  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center text-sm opacity-70">
      Connecting…
    </div>
  );
};
