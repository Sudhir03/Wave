import { useEffect, useRef, useState } from "react";
import socket from "../../socket";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/api/users";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

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
  const peerUserRef = useRef(null);
  const pendingCandidates = useRef([]);
  const callStartTimeRef = useRef(null);

  // =========================
  // STATE
  // =========================
  const [callId, setCallId] = useState();
  const [selfUser, setSelfUser] = useState(null);
  const [peerUser, setPeerUser] = useState(null);
  const [callState, setCallState] = useState("idle");
  // idle | calling | incoming | connected | ended

  const [isVideo, setIsVideo] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [peerCameraOn, setPeerCameraOn] = useState(true);
  const [peerMicOn, setPeerMicOn] = useState(true);
  const [localStreamVersion, setLocalStreamVersion] = useState(0);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);
  const [busyReason, setBusyReason] = useState(null);

  // 🔑 NEW: Presence flag (caller side only)
  const [isCalleeOnline, setIsCalleeOnline] = useState(false);

  //camera switch
  const [currentFacingMode, setCurrentFacingMode] = useState("user");

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
  const cleanupCall = ({ keepState = false } = {}) => {
    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    remoteStreamRef.current = null;
    callStartTimeRef.current = null;

    setHasLocalStream(false);
    setIsVideo(false);
    setIsMinimized(false);
    setIsCalleeOnline(false);
    setPeerUser(null);
    setCallId(null);

    setPeerCameraOn(true);
    setPeerMicOn(true);
    setBusyReason(null);

    socket.currentCallId = null;

    if (!keepState) {
      setCallState("idle");
    }
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
      if (callState !== "idle") {
        toast.info("You are already in a call");
        return;
      }

      // ✅ RESET PEER STATE FOR NEW CALL
      setCallId(null);
      setPeerCameraOn(true);
      setPeerMicOn(true);

      setPeerUser(callee);
      setIsVideo(video);
      setIsMinimized(false);
      setCallState("calling");

      // ✅ RESET STATES HERE
      setIsMicOn(true);
      setIsCameraOn(true);

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
      if (callState !== "incoming") {
        toast.info("No incoming call to accept");
        return;
      }

      // ✅ RESET PEER MEDIA STATE FOR NEW INCOMING CALL
      setPeerCameraOn(true);
      setPeerMicOn(true);

      setIsVideo(video);
      setIsMinimized(false);

      // ✅ RESET STATES HERE
      setIsMicOn(true);
      setIsCameraOn(true);

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
        callId,
      });

      setCallState("connected");
      callStartTimeRef.current = Date.now();
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
      if (callId) {
        socket.emit("webrtc_call_declined", {
          callerId: peerUser.id,
          callId,
        });
      }
    } catch (error) {
      console.error("declineCall failed:", error);
    } finally {
      cleanupCall();
      setCallState("idle");
    }
  };

  const endCall = ({ initiatorUserId }) => {
    try {
      if (callId) {
        socket.emit("webrtc_call_end", {
          targetUserId:
            initiatorUserId === selfUser.id ? peerUser.id : selfUser.id,
          callId,
        });
      }
    } catch (error) {
      console.error("endCall failed:", error);
    } finally {
      cleanupCall();
      setCallState("idle");
    }
  };

  //mic and camera toggle
  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMicOn(audioTrack.enabled);

    socket.emit("webrtc_media_state", {
      targetUserId: peerUser.id,
      cameraOn: isCameraOn,
      micOn: audioTrack.enabled,
    });
  };

  const toggleCamera = async () => {
    const stream = localStreamRef.current;
    if (!stream || !pcRef.current) return;

    const videoTrack = stream.getVideoTracks()[0];

    // CAMERA OFF
    if (videoTrack && videoTrack.enabled) {
      videoTrack.enabled = false;
      setIsCameraOn(false);

      socket.emit("webrtc_media_state", {
        targetUserId: peerUser.id,
        cameraOn: false,
        micOn: isMicOn,
      });

      return;
    }

    // CAMERA ON
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const newVideoTrack = newStream.getVideoTracks()[0];

    // Remove old tracks
    stream.getVideoTracks().forEach((t) => {
      stream.removeTrack(t);
      t.stop();
    });

    stream.addTrack(newVideoTrack);

    // Replace for peer
    const sender = pcRef.current
      .getSenders()
      .find((s) => s.track?.kind === "video");

    sender
      ? await sender.replaceTrack(newVideoTrack)
      : pcRef.current.addTrack(newVideoTrack, stream);

    setIsCameraOn(true);

    // 🔑 THIS is the fix
    setLocalStreamVersion((v) => v + 1);

    socket.emit("webrtc_media_state", {
      targetUserId: peerUser.id,
      cameraOn: true,
      micOn: isMicOn,
    });
  };

  //camera swtich action
  const switchCamera = async () => {
    if (!localStreamRef.current || !pcRef.current) return;

    const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!oldVideoTrack) return;

    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";

    try {
      // 1️⃣ REMOVE + STOP old camera FIRST
      localStreamRef.current.removeTrack(oldVideoTrack);
      oldVideoTrack.stop();

      // 2️⃣ WAIT so mobile devices release camera
      await new Promise((res) => setTimeout(res, 300));

      // 3️⃣ GET new camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: newFacingMode } },
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];

      // 4️⃣ ADD new track
      localStreamRef.current.addTrack(newVideoTrack);

      // 5️⃣ REPLACE track for peer
      const sender = pcRef.current
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) {
        await sender.replaceTrack(newVideoTrack);
      }

      // 6️⃣ UPDATE STATE + refresh preview
      setCurrentFacingMode(newFacingMode);
      setLocalStreamVersion((v) => v + 1);
    } catch (err) {
      console.warn("Camera switch failed:", err);
    }
  };

  //check can switch camera

  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");

        setCanSwitchCamera(videoInputs.length > 1 && isVideo && isCameraOn);
      } catch {
        setCanSwitchCamera(false);
      }
    };

    // run when:
    // - call connects
    // - camera turns on/off
    // - stream changes
    checkCameras();
  }, [isVideo, isCameraOn, localStreamVersion]);

  // =========================
  // UI ONLY
  // =========================
  const minimizeCall = () => setIsMinimized(true);
  const restoreCall = () => setIsMinimized(false);

  // =========================
  //sets peer user
  // =========================
  useEffect(() => {
    peerUserRef.current = peerUser;
  }, [peerUser]);

  // =========================
  // SOCKET LISTENERS
  // =========================
  useEffect(() => {
    // =========================
    // Call Signaling Handlers
    // =========================

    const onOffer = async ({ caller, offer, callType, callId }) => {
      setCallId(callId);
      setPeerUser(caller);
      setCallState("incoming");
      setIsVideo(callType === "video");
      createPeer(caller.id);
      await pcRef.current.setRemoteDescription(offer);

      // 🔥 FLUSH ICE CANDIDATES HERE
      pendingCandidates.current.forEach((c) =>
        pcRef.current.addIceCandidate(c)
      );
      pendingCandidates.current = [];
    };

    const onCallId = ({ callId }) => setCallId(callId);

    const onAnswer = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;

      // 🔥 VERY IMPORTANT GUARD
      if (pc.signalingState !== "have-local-offer") {
        console.warn("Answer ignored. State =", pc.signalingState);
        return;
      }

      await pc.setRemoteDescription(answer);

      pendingCandidates.current.forEach((c) => pc.addIceCandidate(c));
      pendingCandidates.current = [];

      callStartTimeRef.current = Date.now();
      setCallState("connected");
    };

    const onCandidate = ({ candidate }) => {
      if (!pcRef.current) {
        pendingCandidates.current.push(candidate);
        return;
      }

      if (pcRef.current.remoteDescription) {
        pcRef.current.addIceCandidate(candidate);
      } else {
        pendingCandidates.current.push(candidate);
      }
    };

    const onDeclined = () => {
      cleanupCall();
      setCallState("idle");
    };

    const onEnded = () => {
      cleanupCall();
      setCallState("idle");
    };

    const onCalleeStatus = ({ online }) => {
      setIsCalleeOnline(online);

      setCallState((prev) => {
        if (online && prev === "calling") {
          return "ringing";
        }

        if (!online && prev === "calling") {
          return "calling";
        }

        return prev;
      });
    };

    // =========================
    // Media State Handler
    // =========================

    const onPeerMediaState = ({ fromUserId, cameraOn, micOn }) => {
      if (fromUserId !== peerUserRef.current?.id) return;

      setPeerCameraOn(cameraOn);
      setPeerMicOn(micOn);
    };

    //busy
    const onUserBusy = ({ reason }) => {
      setBusyReason(reason || "User is busy on another call");

      cleanupCall({ keepState: true });

      // 🔥 IMPORTANT
      setCallState("busy");
    };

    const onCallCancelled = () => {
      cleanupCall();
      setCallState("idle");
    };

    // =========================
    // Socket Listeners
    // =========================

    socket.on("webrtc_offer", onOffer);
    socket.on("call_id", onCallId);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice_candidate", onCandidate);
    socket.on("webrtc_call_declined", onDeclined);
    socket.on("webrtc_call_end", onEnded);
    socket.on("callee_status", onCalleeStatus);
    socket.on("webrtc_media_state", onPeerMediaState);
    socket.on("webrtc_user_busy", onUserBusy);
    socket.on("webrtc_call_cancelled", onCallCancelled);

    // =========================
    // Cleanup
    // =========================

    return () => {
      socket.off("webrtc_offer", onOffer);
      socket.off("call_id", onCallId);
      socket.off("webrtc_answer", onAnswer);
      socket.off("webrtc_ice_candidate", onCandidate);
      socket.off("webrtc_call_declined", onDeclined);
      socket.off("webrtc_call_end", onEnded);
      socket.off("callee_status", onCalleeStatus);
      socket.off("webrtc_media_state", onPeerMediaState);
      socket.off("webrtc_user_busy", onUserBusy);
      socket.off("webrtc_call_cancelled", onCallCancelled);
    };
  }, []);

  // =========================
  // RING TIMEOUT (CALLER SIDE)
  // =========================
  useEffect(() => {
    if (callState !== "ringing") return;
    if (!selfUser?.id) return;

    const timeout = setTimeout(() => {
      socket.emit("webrtc_call_cancel", { callId });
      cleanupCall();
    }, 30000);

    return () => clearTimeout(timeout);
  }, [callState, callId, selfUser]);

  // automatic cleanup of busy call
  useEffect(() => {
    if (callState === "busy") {
      const t = setTimeout(() => {
        setBusyReason(null);
        setCallState("idle");
      }, 2500);

      return () => clearTimeout(t);
    }
  }, [callState]);

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

    //toggle
    toggleMic,
    toggleCamera,

    switchCamera,
    canSwitchCamera,

    isCameraOn,
    isMicOn,

    peerCameraOn,
    peerMicOn,

    localStreamVersion,

    callStartTimeRef,
    busyReason,
  };
}
