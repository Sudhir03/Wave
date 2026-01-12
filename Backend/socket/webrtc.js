// =======================
// Imports – Presence (Redis)
// =======================
const { isUserOnline } = require("../redis/presence");

const callService = require("../services/callService");

// =======================
// WebRTC Signaling Handlers
// =======================
module.exports = function registerWebRTCHandlers(io, socket) {
  // =======================
  // CHECK CALLEE ONLINE STATUS
  // =======================
  socket.on("check_user_online", async ({ calleeId }) => {
    try {
      const online = await isUserOnline(calleeId);

      socket.emit("callee_status", {
        calleeId,
        online,
      });
    } catch (err) {
      socket.emit("callee_status", {
        calleeId,
        online: false,
      });
    }
  });

  // =======================
  // WEBRTC OFFER
  // =======================
  socket.on("webrtc_offer", async ({ calleeId, offer, callType, caller }) => {
    if (!socket.userId) return;
    const callerId = socket.userId;
    if (!calleeId || callerId === calleeId) return;

    const online = await isUserOnline(calleeId);
    if (!online) {
      socket.emit("callee_status", { online: false });
      return;
    }

    const call = await callService.createCall({
      callerId,
      calleeId,
      callType,
    });

    const callId = call._id.toString();

    io.to(calleeId).emit("webrtc_offer", {
      caller,
      offer,
      callType,
      callId,
    });

    socket.emit("call_id", { callId });
  });

  // =======================
  // WEBRTC ANSWER
  // =======================
  socket.on("webrtc_answer", async ({ callerId, answer, callId }) => {
    if (!socket.userId) return;

    // Mark call as connected in DB
    callService.answerCall({ callId }).catch(() => {});

    const online = await isUserOnline(callerId);
    if (!online) {
      socket.emit("callee_status", { online: false });
      return;
    }

    io.to(callerId).emit("webrtc_answer", {
      answer,
    });
  });

  // =======================
  // WEBRTC ICE CANDIDATE
  // =======================
  socket.on("webrtc_ice_candidate", async ({ targetUserId, candidate }) => {
    if (!socket.userId) return;

    const online = await isUserOnline(targetUserId);
    if (!online) {
      socket.emit("callee_status", { online: false });
      return;
    }

    io.to(targetUserId).emit("webrtc_ice_candidate", {
      candidate,
    });
  });

  // =======================
  // WEBRTC CALL END
  // =======================
  socket.on("webrtc_call_end", async ({ targetUserId, callId }) => {
    if (!socket.userId) return;

    // End call in DB (endedAt + duration)
    callService.endCall({ callId }).catch(() => {});
    io.to(targetUserId).emit("webrtc_call_end");
  });

  // =======================
  // WEBRTC CALL DECLINED
  // =======================
  socket.on("webrtc_call_declined", async ({ callerId, callId }) => {
    if (!socket.userId) return;

    // End call in DB (no connectedAt → duration 0)
    callService.endCall({ callId }).catch(() => {});

    io.to(callerId).emit("webrtc_call_declined");
  });

  // =======================
  // WEBRTC MEDIA STATE (Mic / Camera)
  // =======================
  socket.on("webrtc_media_state", async ({ targetUserId, cameraOn, micOn }) => {
    if (!socket.userId) return;

    const online = await isUserOnline(targetUserId);
    if (!online) return;

    io.to(targetUserId).emit("webrtc_media_state", {
      fromUserId: socket.userId,
      cameraOn,
      micOn,
    });
  });
};
