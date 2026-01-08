import { CallBackground } from "./CallBackground";
import { CallTopBar } from "@/components/molecules/CallTopBar";
import { IncomingCallActions } from "@/components/molecules/IncomingCallActions";
import { CallControls } from "@/components/molecules/CallControls";
import { useWebRTC } from "@/features/webrtc/CallContext";
import { useRef, useEffect } from "react";

export const CallScreen = () => {
  const {
    peer,
    callState, // idle | calling | incoming | connected | ended
    isCalleeOnline,
    isVideo,
    isMinimized,
    hasLocalStream,
    localStreamRef,
    remoteStreamRef,
    acceptCall,
    declineCall,
    endCall,
    minimizeCall,
    restoreCall,
  } = useWebRTC();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach LOCAL stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [hasLocalStream]);

  // Attach REMOTE stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef.current]);

  if (callState === "idle" || callState === "ended") return null;

  /* ================= MINIMIZED ================= */
  if (isMinimized) {
    return (
      <div
        onClick={restoreCall}
        className="fixed bottom-6 right-6 z-50 cursor-pointer group"
      >
        {/* VIDEO CALL → LIVE PREVIEW */}
        {isVideo && remoteStreamRef.current ? (
          <video
            ref={(el) => {
              if (el && remoteStreamRef.current) {
                el.srcObject = remoteStreamRef.current;
              }
            }}
            autoPlay
            muted
            playsInline
            className="w-28 h-40 rounded-xl object-cover shadow-xl border border-white/10"
          />
        ) : (
          /* AUDIO CALL → ICON */
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
            📞
          </div>
        )}

        {/* optional hover hint */}
        <span className="absolute -top-6 right-0 text-xs opacity-0 group-hover:opacity-100 transition">
          Tap to return
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 text-white overflow-hidden">
      {/* BACKGROUND */}
      <CallBackground
        peer={peer}
        isVideo={isVideo}
        callState={callState}
        hasLocalStream={hasLocalStream}
        hasRemoteStream={!!remoteStreamRef.current}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />

      {/* TOP BAR */}
      {isVideo && !isMinimized && (
        <CallTopBar
          peer={peer}
          callState={callState}
          isCalleeOnline={isCalleeOnline}
          onMinimize={minimizeCall}
        />
      )}

      {/* INCOMING (receiver only) */}
      {callState === "incoming" && (
        <IncomingCallActions
          isVideo={isVideo}
          onAccept={() => acceptCall({ video: isVideo })}
          onDecline={declineCall}
        />
      )}

      {/* CONTROLS (caller + connected) */}
      {(callState === "calling" || callState === "connected") && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <CallControls onEnd={endCall} type={isVideo ? "video" : "voice"} />
        </div>
      )}
    </div>
  );
};
