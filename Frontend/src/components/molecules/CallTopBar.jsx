import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";

export const CallTopBar = ({
  isVideo,
  peer,
  callState,
  isCalleeOnline,
  onMinimize,
}) => {
  return (
    <div className="absolute top-0 left-0 w-full flex items-center px-4 py-3 bg-black/40 backdrop-blur-sm z-20">
      {/* LEFT SIDE (peer info or placeholder) */}
      <div className="flex items-center gap-3 flex-1">
        {isVideo && (
          <>
            <Avatar className="w-9 h-9">
              {peer?.avatar ? (
                <AvatarImage src={peer.avatar} />
              ) : (
                <AvatarFallback>{peer?.name?.charAt(0) || "U"}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-col">
              <span className="font-medium">{peer?.name || "Unknown"}</span>

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

      {/* RIGHT SIDE (always fixed) */}
      <button
        onClick={onMinimize}
        className="text-sm opacity-80 hover:opacity-100"
      >
        Minimize
      </button>
    </div>
  );
};
