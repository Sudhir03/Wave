import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";

export const CallTopBar = ({
  isVideo,
  peer,
  callState,
  isCalleeOnline,
  onMinimize,
}) => {
  const [seconds, setSeconds] = useState(0);

  // =========================
  // CALL TIMER
  // =========================
  useEffect(() => {
    if (callState !== "connected") {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="absolute top-0 left-0 w-full h-14 px-4 bg-black/40 backdrop-blur-sm z-20 flex items-center">
      {/* ================= LEFT (Peer Info) ================= */}
      <div className="flex items-center gap-3">
        {isVideo && callState !== "incoming" && (
          <>
            <Avatar className="w-9 h-9">
              {peer?.avatar ? (
                <AvatarImage src={peer.avatar} />
              ) : (
                <AvatarFallback>{peer?.name?.charAt(0) || "U"}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-col leading-tight">
              <span className="font-medium text-sm">
                {peer?.name || "Unknown"}
              </span>

              <span className="text-xs text-gray-300">
                {callState === "calling" &&
                  (isCalleeOnline ? "Ringing…" : "Calling…")}
                {callState === "incoming" && "Incoming call…"}
                {callState === "connected" && "In call"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ================= CENTER (Timer) ================= */}
      {callState === "connected" && (
        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold tracking-wide text-white">
          {formatTime(seconds)}
        </div>
      )}

      {/* ================= RIGHT (Actions) ================= */}
      <div className="ml-auto">
        <button
          onClick={onMinimize}
          className="text-sm opacity-80 hover:opacity-100"
        >
          Minimize
        </button>
      </div>
    </div>
  );
};
