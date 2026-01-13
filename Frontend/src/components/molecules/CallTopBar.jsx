import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { MicOff } from "lucide-react";

export const CallTopBar = ({
  callStartTime,
  peer,
  callState,
  isCalleeOnline,
  onMinimize,
  peerMicOn,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (callState !== "connected" || !callStartTime) {
      setSeconds(0);
      return;
    }

    const update = () =>
      setSeconds(Math.floor((Date.now() - callStartTime) / 1000));

    update();

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [callState, callStartTime]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="absolute top-0 left-0 w-full min-h-14 px-3 sm:px-4 bg-black/40 backdrop-blur-sm z-20 flex items-center">
      {/* ================= LEFT (Peer Info) ================= */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {callState !== "incoming" && (
          <>
            <Avatar className="w-8 h-8 sm:w-9 sm:h-9 shrink-0">
              {peer?.avatar ? (
                <AvatarImage src={peer.avatar} />
              ) : (
                <AvatarFallback>{peer?.name?.charAt(0) || "U"}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
                  {peer?.name || "Unknown"}
                </span>

                {!peerMicOn && (
                  <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                )}
              </div>

              <span className="text-[10px] sm:text-xs text-gray-300 truncate">
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
        <div className="absolute left-1/2 -translate-x-1/2 text-xs sm:text-sm font-semibold tracking-wide text-white pointer-events-none">
          {formatTime(seconds)}
        </div>
      )}

      {/* ================= RIGHT (Actions) ================= */}
      <div className="ml-auto flex items-center">
        <button
          onClick={onMinimize}
          className="text-xs sm:text-sm opacity-80 hover:opacity-100 px-2 py-1"
        >
          Minimize
        </button>
      </div>
    </div>
  );
};
