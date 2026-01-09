import { CallBackground } from "./CallBackground";
import { CallTopBar } from "@/components/molecules/CallTopBar";
import { IncomingCallActions } from "@/components/molecules/IncomingCallActions";
import { CallControls } from "@/components/molecules/CallControls";
import { useWebRTC } from "@/features/webrtc/CallContext";
import { useRef, useEffect } from "react";

export const CallScreen = () => {
  const {
    selfUser,
    peerUser,
    callState,
    isVideo,
    isMinimized,
    hasLocalStream,
    isCalleeOnline,

    acceptCall,
    declineCall,
    endCall,
    minimizeCall,
    restoreCall,

    localStreamRef,
    remoteStreamRef,
  } = useWebRTC();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  /* ================= ATTACH LOCAL STREAM ================= */
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [callState, hasLocalStream]);

  /* ================= ATTACH REMOTE STREAM ================= */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callState]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, []);

  if (callState === "idle" || callState === "ended") return null;

  /* ================= MINIMIZED VIEW ================= */
  if (isMinimized) {
    return (
      <div
        onClick={restoreCall}
        className="fixed bottom-6 right-6 z-50 cursor-pointer group"
      >
        {/* VIDEO CALL → LIVE PREVIEW */}
        {isVideo && remoteStreamRef.current ? (
          <video
            ref={remoteVideoRef}
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

        <span className="absolute -top-6 right-0 text-xs opacity-0 group-hover:opacity-100 transition">
          Tap to return
        </span>
      </div>
    );
  }

  /* ================= FULL CALL SCREEN ================= */
  return (
    <div className="fixed inset-0 z-50 text-white overflow-hidden">
      {/* BACKGROUND */}
      <CallBackground
        peer={peerUser}
        isVideo={isVideo}
        callState={callState}
        hasLocalStream={hasLocalStream}
        hasRemoteStream={!!remoteStreamRef.current}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />

      {/* TOP BAR */}
      {isVideo && (
        <CallTopBar
          peer={peerUser}
          callState={callState}
          isCalleeOnline={isCalleeOnline}
          onMinimize={minimizeCall}
        />
      )}

      {/* INCOMING CALL ACTIONS */}
      {callState === "incoming" && (
        <IncomingCallActions
          isVideo={isVideo}
          onAccept={() => acceptCall({ video: isVideo })}
          onDecline={declineCall}
        />
      )}

      {(callState === "calling" ||
        callState === "ringing" ||
        callState === "connected") && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <CallControls
            onEnd={() => endCall({ initiatorUserId: selfUser.id })}
            type={isVideo ? "video" : "voice"}
          />
        </div>
      )}
    </div>
  );
};
