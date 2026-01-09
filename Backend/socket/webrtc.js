// =======================
// Imports – Presence (Redis)
// =======================
const { isUserOnline } = require("../redis/presence");

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

    const online = await isUserOnline(calleeId);
    if (!online) {
      socket.emit("callee_status", { online: false });
      return;
    }

    io.to(calleeId).emit("webrtc_offer", {
      caller, // ✅ forward caller data
      offer,
      callType,
    });
  });

  // =======================
  // WEBRTC ANSWER
  // =======================
  socket.on("webrtc_answer", async ({ callerId, answer }) => {
    if (!socket.userId) return;

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
  socket.on("webrtc_call_end", ({ targetUserId }) => {
    if (!socket.userId) return;

    io.to(targetUserId).emit("webrtc_call_end");
  });

  // =======================
  // WEBRTC CALL DECLINED
  // =======================
  socket.on("webrtc_call_declined", ({ callerId }) => {
    if (!socket.userId) return;

    io.to(callerId).emit("webrtc_call_declined");
  });
};
