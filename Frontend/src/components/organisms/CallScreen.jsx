import { CallBackground } from "@/components/organisms/CallBackground";
import { CallTopBar } from "@/components/molecules/CallTopBar";
import { IncomingCallActions } from "@/components/molecules/IncomingCallActions";
import { CallControls } from "@/components/molecules/CallControls";
import { useWebRTC } from "@/features/webrtc/CallContext";
import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../atoms/Avatar";

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

    toggleMic,
    toggleCamera,

    switchCamera,
    canSwitchCamera,

    isMicOn,
    isCameraOn,

    peerCameraOn,
    peerMicOn,

    localStreamVersion,
  } = useWebRTC();

  /* ================= VIDEO REFS ================= */
  const localVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const minimizedRemoteVideoRef = useRef(null);

  /* ================= ATTACH LOCAL STREAM ================= */
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [callState, hasLocalStream, localStreamVersion]);

  /* ================= ATTACH REMOTE STREAM (FULLSCREEN) ================= */
  useEffect(() => {
    if (!isMinimized && remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callState, isMinimized]);

  useEffect(() => {
    if (!isVideo && remoteAudioRef.current && remoteStreamRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callState, isVideo]);

  /* ================= ATTACH REMOTE STREAM (MINIMIZED) ================= */
  useEffect(() => {
    if (
      isMinimized &&
      minimizedRemoteVideoRef.current &&
      remoteStreamRef.current
    ) {
      minimizedRemoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [isMinimized]);

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (minimizedRemoteVideoRef.current)
        minimizedRemoteVideoRef.current.srcObject = null;
    };
  }, []);

  if (callState === "idle" || callState === "ended") return null;

  /* ================= MINIMIZED VIEW ================= */
  if (isMinimized) {
    return (
      <div
        onClick={restoreCall}
        className="fixed bottom-12 left-12 z-50 cursor-pointer group"
      >
        {isVideo && remoteStreamRef.current && peerCameraOn ? (
          <video
            ref={minimizedRemoteVideoRef}
            autoPlay
            playsInline
            className="w-28 h-40 rounded-xl object-cover shadow-xl border border-white/10 bg-black"
          />
        ) : (
          <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center shadow-2xl ring-2 ring-white/10">
            <Avatar className="w-full h-full">
              <AvatarImage src={peerUser.avatar} className="object-cover" />
              <AvatarFallback className="bg-neutral-800 text-3xl font-semibold">
                {peerUser.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
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
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        peerCameraOn={peerCameraOn} // 👈 ADD
        peerMicOn={peerMicOn} // 👈 ADD
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
      />

      {/* TOP BAR */}
      <CallTopBar
        isVideo={isVideo}
        peer={peerUser}
        callState={callState}
        isCalleeOnline={isCalleeOnline}
        onMinimize={minimizeCall}
      />

      {/* INCOMING CALL ACTIONS */}
      {callState === "incoming" && (
        <IncomingCallActions
          isVideo={isVideo}
          onAccept={() => acceptCall({ video: isVideo })}
          onDecline={declineCall}
        />
      )}

      {/* 🔊 REMOTE AUDIO (audio-only calls) */}
      {!isVideo && callState === "connected" && (
        <audio ref={remoteAudioRef} autoPlay playsInline />
      )}

      {/* CALL CONTROLS */}
      {(callState === "calling" ||
        callState === "ringing" ||
        callState === "connected") && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <CallControls
            onEnd={() => endCall({ initiatorUserId: selfUser.id })}
            type={isVideo ? "video" : "voice"}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onSwitchCamera={switchCamera}
            canSwitchCamera={canSwitchCamera}
          />
        </div>
      )}
    </div>
  );
};
