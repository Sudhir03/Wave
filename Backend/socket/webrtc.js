const { isUserOnline } = require("../redis/presence");
const callService = require("../services/callService");

module.exports = function registerWebRTCHandlers(io, socket) {
  // =======================
  // WEBRTC OFFER
  // =======================
  socket.on("webrtc_offer", async ({ calleeId, offer, callType, caller }) => {
    if (!socket.userId) return;

    const online = await isUserOnline(calleeId);
    if (!online) {
      socket.emit("callee_status", { online: false });
      return;
    }

    // ✅ CREATE CALL (NON-BLOCKING)
    const call = await callService.createCall({
      callerId: socket.userId,
      calleeId,
      callType,
    });

    const callId = call._id.toString();

    io.to(calleeId).emit("webrtc_offer", {
      caller,
      offer,
      callType,
      callId, // ✅ SEND callId
    });

    // ✅ SEND callId BACK TO CALLER TOO
    socket.emit("call_id", { callId });
  });

  // =======================
  // WEBRTC ANSWER
  // =======================
  socket.on("webrtc_answer", async ({ callerId, answer, callId }) => {
    if (!socket.userId) return;

    // ✅ Update DB async (do NOT block signaling)
    if (callId) {
      callService.answerCall({ callId }).catch(() => {});
    }

    io.to(callerId).emit("webrtc_answer", {
      answer,
      callId,
    });
  });

  // =======================
  // WEBRTC CALL END
  // =======================
  socket.on("webrtc_call_end", ({ targetUserId, callId }) => {
    if (!socket.userId) return;

    if (callId) {
      callService.endCall({ callId }).catch(() => {});
    }

    io.to(targetUserId).emit("webrtc_call_end", { callId });
  });

  // =======================
  // WEBRTC CALL DECLINED
  // =======================
  socket.on("webrtc_call_declined", ({ callerId, callId }) => {
    if (!socket.userId) return;

    if (callId) {
      callService.endCall({ callId }).catch(() => {});
    }

    io.to(callerId).emit("webrtc_call_declined", { callId });
  });

  // =======================
  // WEBRTC ICE
  // =======================
  socket.on("webrtc_ice_candidate", ({ targetUserId, candidate }) => {
    if (!socket.userId) return;

    io.to(targetUserId).emit("webrtc_ice_candidate", { candidate });
  });

  // =======================
  // MEDIA STATE
  // =======================
  socket.on("webrtc_media_state", ({ targetUserId, cameraOn, micOn }) => {
    if (!socket.userId) return;

    io.to(targetUserId).emit("webrtc_media_state", {
      fromUserId: socket.userId,
      cameraOn,
      micOn,
    });
  });
};
