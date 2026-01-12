// =======================
// Imports – Presence (Redis)
// =======================
const { isUserOnline } = require("../redis/presence");

// =======================
// Imports – Call Service
// =======================
const callService = require("../services/callService");

// =======================
// WebRTC Signaling Handlers
// =======================
module.exports = function registerWebRTCHandlers(io, socket) {
  // =======================
  // WEBRTC OFFER (CALL START)
  // =======================
  socket.on("webrtc_offer", async ({ calleeId, offer, callType, caller }) => {
    if (!socket.userId) return;

    const callerId = socket.userId;
    if (!calleeId || callerId === calleeId) return;

    // 1️⃣ Create call record (ALWAYS)
    const call = await callService.createCall({
      callerId,
      calleeId,
      callType,
    });

    const callId = call._id.toString();

    // 2️⃣ Emit offer (best-effort)
    io.to(calleeId).emit("webrtc_offer", {
      callId,
      caller,
      offer,
      callType,
    });

    // 3️⃣ Online check (caller UI feedback only)
    const online = await isUserOnline(calleeId);
    if (!online) {
      socket.emit("callee_status", { online: false });
    }
  });

  // =======================
  // WEBRTC ANSWER (CALL ACCEPT)
  // =======================
  socket.on("webrtc_answer", async ({ callerId, callId, answer }) => {
    if (!socket.userId || !callId) return;

    // 1️⃣ Mark call as connected in DB
    await callService.answerCall({ callId });

    // 2️⃣ Forward answer (best-effort)
    io.to(callerId).emit("webrtc_answer", {
      callId,
      answer,
    });
  });

  // =======================
  // WEBRTC ICE CANDIDATE
  // =======================
  socket.on("webrtc_ice_candidate", ({ targetUserId, candidate }) => {
    if (!socket.userId || !targetUserId || !candidate) return;

    // Best-effort forward
    io.to(targetUserId).emit("webrtc_ice_candidate", {
      candidate,
    });
  });

  // =======================
  // WEBRTC CALL END
  // =======================
  socket.on("webrtc_call_end", async ({ targetUserId, callId }) => {
    if (!socket.userId || !callId) return;

    // 1️⃣ End call in DB (endedAt + duration)
    await callService.endCall({ callId });

    // 2️⃣ Notify other peer (best-effort)
    io.to(targetUserId).emit("webrtc_call_end", {
      callId,
    });
  });

  // =======================
  // WEBRTC CALL DECLINED
  // =======================
  socket.on("webrtc_call_declined", async ({ callerId, callId }) => {
    if (!socket.userId || !callId) return;

    // 1️⃣ End call in DB (no connectedAt → duration 0)
    await callService.endCall({ callId });

    // 2️⃣ Notify caller (best-effort)
    io.to(callerId).emit("webrtc_call_declined", {
      callId,
    });
  });

  // =======================
  // WEBRTC MEDIA STATE (Mic / Camera)
  // =======================
  socket.on("webrtc_media_state", ({ targetUserId, cameraOn, micOn }) => {
    if (!socket.userId || !targetUserId) return;

    // Best-effort forward
    io.to(targetUserId).emit("webrtc_media_state", {
      fromUserId: socket.userId,
      cameraOn,
      micOn,
    });
  });
};
