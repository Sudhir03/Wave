import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";

export const CallTopBar = ({ peer, callState, isCalleeOnline, onMinimize }) => (
  <div className="absolute top-0 left-0 w-full flex justify-between items-center px-4 py-3 bg-black/40 backdrop-blur-sm z-20">
    <div className="flex items-center gap-3">
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
          {/* CALLER */}
          {callState === "calling" &&
            (isCalleeOnline ? "Ringing…" : "Calling…")}

          {/* RECEIVER */}
          {callState === "incoming" && "Incoming call…"}

          {/* BOTH */}
          {callState === "connected" && "In call"}
        </span>
      </div>
    </div>

    <button onClick={onMinimize} className="text-sm opacity-80">
      Minimize
    </button>
  </div>
);
