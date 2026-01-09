import { useEffect, useRef, useState } from "react";
import socket from "../../socket";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTCInternal() {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // =========================
  // STATE
  // =========================
  const [callee, setCallee] = useState(null);
  const [callState, setCallState] = useState("idle");
  // idle | calling | incoming | connected | ended

  const [isVideo, setIsVideo] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasLocalStream, setHasLocalStream] = useState(false);

  // 🔑 NEW: Presence flag (caller side only)
  const [isCalleeOnline, setIsCalleeOnline] = useState(false);

  // =========================
  // PEER
  // =========================
  const createPeer = () => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc_ice_candidate", { candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      remoteStreamRef.current = e.streams[0];
    };

    pcRef.current = pc;
  };

  // =========================
  // CLEANUP (LOCAL ONLY)
  // =========================
  const cleanupCall = () => {
    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    remoteStreamRef.current = null;

    setHasLocalStream(false);
    setIsVideo(false);
    setIsMinimized(false);
    setIsCalleeOnline(false);
  };

  // =========================
  // CALLER
  // =========================
  const startCall = async ({ video = false, callee }) => {
    setCallee(callee);
    setIsVideo(video);
    setIsMinimized(false);
    setCallState("calling");

    // 🔹 Ask backend if callee is online
    if (callee?.id) {
      const userId = callee.id;
      socket.emit("check_user_online", { userId });
    }

    // 🔹 Media (STRICT)
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video,
    });

    // Extra safety: audio call => no video tracks
    if (!video) {
      localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
    }

    setHasLocalStream(true);

    createPeer();

    localStreamRef.current.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, localStreamRef.current);
    });

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socket.emit("webrtc_offer", { offer, callType: video ? "video" : "audio" });
  };

  // =========================
  // RECEIVER
  // =========================
  const acceptCall = async ({ video = false }) => {
    setIsVideo(video);
    setIsMinimized(false);

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video,
    });

    if (!video) {
      localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
    }

    setHasLocalStream(true);

    createPeer();

    localStreamRef.current.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, localStreamRef.current);
    });

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socket.emit("webrtc_answer", { answer });
    setCallState("connected");
  };

  // =========================
  // END / DECLINE
  // =========================
  const declineCall = () => {
    socket.emit("webrtc_call_declined");
    cleanupCall();
    setCallState("idle");
  };

  const endCall = () => {
    socket.emit("webrtc_call_end");
    cleanupCall();
    setCallState("ended");
  };

  // =========================
  // UI ONLY
  // =========================
  const minimizeCall = () => setIsMinimized(true);
  const restoreCall = () => setIsMinimized(false);

  // =========================
  // SOCKET LISTENERS
  // =========================
  useEffect(() => {
    const onOffer = async ({ offer, callType }) => {
      setCallState("incoming"); // 🔥 NOT ringing
      setIsVideo(callType === "video" ? true : false);
      createPeer();
      await pcRef.current.setRemoteDescription(offer);
    };

    const onAnswer = async ({ answer }) => {
      await pcRef.current.setRemoteDescription(answer);
      setCallState("connected");
    };

    const onCandidate = ({ candidate }) => {
      pcRef.current?.addIceCandidate(candidate);
    };

    const onDeclined = () => {
      cleanupCall();
      setCallState("ended");
    };

    const onEnded = () => {
      cleanupCall();
      setCallState("ended");
    };

    const onCalleeStatus = ({ online }) => {
      setIsCalleeOnline(online);
    };

    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice_candidate", onCandidate);
    socket.on("webrtc_call_declined", onDeclined);
    socket.on("webrtc_call_end", onEnded);
    socket.on("callee_status", onCalleeStatus);

    return () => {
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("webrtc_ice_candidate", onCandidate);
      socket.off("webrtc_call_declined", onDeclined);
      socket.off("webrtc_call_end", onEnded);
      socket.off("callee_status", onCalleeStatus);
    };
  }, []);

  // =========================
  // EXPOSE
  // =========================
  return {
    // state
    peer,
    callState,
    isVideo,
    isMinimized,
    hasLocalStream,
    isCalleeOnline, // 🔑 IMPORTANT

    // actions
    startCall,
    acceptCall,
    declineCall,
    endCall,
    minimizeCall,
    restoreCall,

    // refs
    localStreamRef,
    remoteStreamRef,
  };
}
