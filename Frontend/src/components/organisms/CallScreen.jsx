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
    callStartTimeRef,
    busyReason,
  } = useWebRTC();

  /* ================= REFS ================= */
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const minimizedRemoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  /* ================= LOCAL VIDEO ================= */
  useEffect(() => {
    const videoEl = localVideoRef.current;
    const stream = localStreamRef.current;

    if (!videoEl || !stream || !isCameraOn) return;

    // 🔥 RESET srcObject on restore
    videoEl.srcObject = null;
    videoEl.srcObject = stream;

    videoEl.muted = true;
    videoEl.playsInline = true;

    const play = async () => {
      try {
        await videoEl.play();
      } catch (e) {
        console.warn("Local video play failed", e);
      }
    };

    play();
  }, [
    hasLocalStream,
    localStreamVersion,
    callState,
    isMinimized, // 🔥 ADD THIS
    isCameraOn,
  ]);

  /* ================= REMOTE VIDEO (FULL) ================= */
  useEffect(() => {
    if (!isMinimized && remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [isMinimized, callState]);

  /* ================= REMOTE VIDEO (MINIMIZED) ================= */
  useEffect(() => {
    if (
      isMinimized &&
      minimizedRemoteVideoRef.current &&
      remoteStreamRef.current
    ) {
      // 🔥 CLONE stream for minimized
      minimizedRemoteVideoRef.current.srcObject =
        remoteStreamRef.current.clone();
    }
  }, [isMinimized]);

  /* ================= 🔊 REMOTE AUDIO (ALWAYS ON) ================= */
  useEffect(() => {
    if (remoteAudioRef.current && remoteStreamRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callState, isMinimized]);

  if (callState === "idle" || callState === "ended") return null;

  return (
    <>
      {/* 🔊 AUDIO NEVER UNMOUNTS */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      />

      {/* ================= MINIMIZED VIEW ================= */}
      {isMinimized ? (
        <div
          onClick={restoreCall}
          className="fixed bottom-12 left-12 z-50 cursor-pointer"
        >
          {isVideo && remoteStreamRef.current && peerCameraOn ? (
            <video
              ref={minimizedRemoteVideoRef}
              autoPlay
              playsInline
              className="w-28 h-40 rounded-xl object-cover bg-black"
            />
          ) : (
            <div className="w-28 h-28 bg-black rounded-full flex items-center justify-center">
              <Avatar className="w-full h-full">
                <AvatarImage src={peerUser.avatar} />
                <AvatarFallback>{peerUser.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      ) : (
        /* ================= FULL CALL SCREEN ================= */
        <div className="fixed inset-0 z-50 text-white overflow-hidden">
          <CallBackground
            peer={peerUser}
            isVideo={isVideo}
            callState={callState}
            hasLocalStream={hasLocalStream}
            hasRemoteStream={!!remoteStreamRef.current}
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            peerCameraOn={peerCameraOn}
            localVideoRef={localVideoRef}
            busyReason={busyReason}
            remoteVideoRef={remoteVideoRef}
          />

          <CallTopBar
            peer={peerUser}
            callState={callState}
            callStartTime={callStartTimeRef.current}
            peerMicOn={peerMicOn}
            isCalleeOnline={isCalleeOnline}
            onMinimize={minimizeCall}
          />

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
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <CallControls
                onEnd={() => endCall({ initiatorUserId: selfUser.id })}
                type={isVideo ? "video" : "audio"}
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
                onToggleMic={toggleMic}
                onToggleCamera={toggleCamera}
                onSwitchCamera={switchCamera}
                canSwitchCamera={canSwitchCamera}
                localStreamRef={localStreamRef}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
