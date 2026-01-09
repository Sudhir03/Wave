import { useEffect, useRef, useState } from "react";
import socket from "../../socket";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/api/users";
import { useAuth } from "@clerk/clerk-react";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useWebRTCInternal() {
  const { getToken } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const token = await getToken();
      return getMyProfile({ token });
    },
    select: (res) => res.user,
  });

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // =========================
  // STATE
  // =========================
  const [selfUser, setSelfUser] = useState(null);
  const [peerUser, setPeerUser] = useState(null);
  const [callState, setCallState] = useState("idle");
  // idle | calling | incoming | connected | ended

  const [isVideo, setIsVideo] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  // 🔑 NEW: Presence flag (caller side only)
  const [isCalleeOnline, setIsCalleeOnline] = useState(false);

  useEffect(() => {
    if (!profile?._id) return;

    setSelfUser({
      id: profile._id,
      name: `${profile.firstName} ${profile.lastName}`,
      avatar: profile.profileImageUrl,
    });
  }, [profile]);

  // =========================
  // PEER
  // =========================
  const createPeer = (targetUserId) => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("webrtc_ice_candidate", {
          candidate: e.candidate,
          targetUserId,
        });
      }
    };

    pc.ontrack = (e) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        setHasRemoteStream(true);
      }

      const alreadyAdded = remoteStreamRef.current
        .getTracks()
        .some((track) => track.id === e.track.id);

      if (!alreadyAdded) {
        remoteStreamRef.current.addTrack(e.track);
      }
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
    setHasRemoteStream(false);
    setIsVideo(false);
    setIsMinimized(false);
    setIsCalleeOnline(false);
    setPeerUser(null);
  };

  // =========================
  // CALLER
  // =========================
  const startCall = async ({ video = false, callee }) => {
    try {
      if (!selfUser) {
        console.error("Caller profile missing");
        return;
      }

      setPeerUser(callee);
      setIsVideo(video);
      setIsMinimized(false);
      setCallState("calling");

      // 🔹 Optional: check if callee is online

      socket.emit("check_user_online", { calleeId: callee.id });

      // 🔹 Get media
      localStreamRef.current = await navigator.mediaDevices.getUserMedia(
        video ? { audio: true, video: true } : { audio: true }
      );

      // 🔹 Audio-only safety
      if (!video) {
        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      }

      setHasLocalStream(true);

      // 🔹 Create PeerConnection
      createPeer(callee.id);

      // 🔹 Add tracks
      localStreamRef.current.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, localStreamRef.current);
      });

      // 🔹 Offer
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // 🔹 Send offer WITH caller profile
      socket.emit("webrtc_offer", {
        calleeId: callee.id,
        offer,
        callType: video ? "video" : "audio",
        caller: selfUser,
      });
    } catch (err) {
      console.error("startCall failed:", err);
      setCallState("idle");
    }
  };

  // =========================
  // RECEIVER
  // =========================
  const acceptCall = async ({ video = false }) => {
    try {
      if (!selfUser) {
        console.error("Caller profile missing");
        return;
      }

      setIsVideo(video);
      setIsMinimized(false);

      // 🔹 Create Peer first (callerId for ICE routing)
      if (!peerUser?.id) return;
      createPeer(peerUser.id);

      // 🔹 Get media
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video === true,
      });

      // 🔹 Audio-only safety
      if (!video) {
        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      }

      setHasLocalStream(true);

      // 🔹 Add tracks
      localStreamRef.current.getTracks().forEach((track) => {
        pcRef.current.addTrack(track, localStreamRef.current);
      });

      // 🔹 Create + set answer
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      // 🔹 Send answer back to caller
      socket.emit("webrtc_answer", {
        callerId: peerUser.id,
        answer,
      });

      setCallState("connected");
    } catch (err) {
      console.error("acceptCall failed:", err);
      setCallState("idle");
    }
  };

  // =========================
  // END / DECLINE
  // =========================
  const declineCall = () => {
    try {
      socket.emit("webrtc_call_declined", {
        callerId: peerUser.id,
      });
    } catch (error) {
      console.error("declineCall failed:", error);
    } finally {
      cleanupCall();
      setCallState("ended");
    }
  };

  const endCall = ({ initiatorUserId }) => {
    try {
      socket.emit("webrtc_call_end", {
        targetUserId:
          initiatorUserId === selfUser.id ? peerUser.id : selfUser.id,
      });
    } catch (error) {
      console.error("endCall failed:", error);
    } finally {
      cleanupCall();
      setCallState("ended");
    }
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
    const onOffer = async ({ caller, offer, callType }) => {
      setPeerUser(caller);
      setCallState("incoming");
      setIsVideo(callType === "video" ? true : false);
      createPeer(caller.id);
      await pcRef.current.setRemoteDescription(offer);
    };

    const onAnswer = async ({ answer }) => {
      await pcRef.current.setRemoteDescription(answer);
      setCallState("connected");
    };

    const onCandidate = ({ candidate }) => {
      if (pcRef.current?.remoteDescription) {
        pcRef.current.addIceCandidate(candidate);
      }
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

      if (online) {
        setCallState("ringing"); // 👈 THIS IS MISSING
      } else {
        cleanupCall();
        setCallState("idle");
      }
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
    selfUser,
    peerUser,
    callState,
    isVideo,
    isMinimized,
    hasLocalStream,
    isCalleeOnline,

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
