// =======================
// Imports – Presence (Redis)
// =======================
const {
  isUserOnline,
  isUserBusy,
  setUserBusy,
  clearUserBusy,
} = require("../redis/presence");

const callService = require("../services/callService");

// 🔥 ADD THIS
const { redis } = require("../redis/redis");

// =======================
// 🔥 NEW HELPER (ADDED ONLY)
// =======================
async function clearCallById(callId) {
  if (!callId) return;

  const key = `call:${callId}`;
  const data = await redis.get(key);
  if (!data) return;

  const { callerId, calleeId } = JSON.parse(data);

  await Promise.all([
    clearUserBusy(callerId),
    clearUserBusy(calleeId),
    redis.del(key),
  ]);
}

async function safeEndCall(callId) {
  if (!callId) return;
  await callService.endCall({ callId }).catch(() => {});
}

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

    if (await isUserBusy(calleeId)) {
      await clearUserBusy(callerId);

      socket.emit("webrtc_user_busy", {
        reason: "User is already on another call",
      });
      return;
    }

    const call = await callService.createCall({
      callerId,
      calleeId,
      callType,
    });

    const callId = call._id.toString();

    // 🔥 EXISTING
    await setUserBusy(callerId, callId);
    await setUserBusy(calleeId, callId);

    // 🔥 NEW (ADDED)
    await redis.set(`call:${callId}`, JSON.stringify({ callerId, calleeId }), {
      EX: 120,
    });

    socket.currentCallId = callId;

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

    socket.currentCallId = callId;

    callService.answerCall({ callId }).catch(() => {});

    const online = await isUserOnline(callerId);
    if (!online) {
      socket.emit("callee_status", { online: false });
      return;
    }

    io.to(callerId).emit("webrtc_answer", { answer });
  });

  // =======================
  // WEBRTC ICE CANDIDATE
  // =======================
  socket.on("webrtc_ice_candidate", async ({ targetUserId, candidate }) => {
    if (!socket.userId) return;

    const online = await isUserOnline(targetUserId);
    if (!online) return;

    io.to(targetUserId).emit("webrtc_ice_candidate", { candidate });
  });

  // =======================
  // WEBRTC CALL END
  // =======================
  socket.on("webrtc_call_end", async ({ targetUserId, callId }) => {
    await safeEndCall(callId);
    await clearCallById(callId);
    socket.currentCallId = null;
    io.to(targetUserId).emit("webrtc_call_end");
  });

  // =======================
  // WEBRTC CALL DECLINED
  // =======================
  socket.on("webrtc_call_declined", async ({ callerId, callId }) => {
    await safeEndCall(callId);

    await clearCallById(callId);
    socket.currentCallId = null;
    io.to(callerId).emit("webrtc_call_declined");
  });

  // =======================
  // WEBRTC MEDIA STATE
  // =======================
  socket.on("webrtc_media_state", async ({ targetUserId, cameraOn, micOn }) => {
    if (!socket.userId) return;
    if (!(await isUserOnline(targetUserId))) return;

    io.to(targetUserId).emit("webrtc_media_state", {
      fromUserId: socket.userId,
      cameraOn,
      micOn,
    });
  });

  // =======================
  // CALL CANCEL
  // =======================
  socket.on("webrtc_call_cancel", async ({ callId }) => {
    await safeEndCall(callId);

    const data = await redis.get(`call:${callId}`);
    if (data) {
      const { calleeId } = JSON.parse(data);
      io.to(calleeId).emit("webrtc_call_cancelled");
    }

    await clearCallById(callId);
    socket.currentCallId = null;
  });

  // =======================
  // DISCONNECT
  // =======================
  socket.on("disconnect", async () => {
    if (socket.currentCallId) {
      await safeEndCall(socket.currentCallId); // ✅ FIX
      await clearCallById(socket.currentCallId);
      socket.currentCallId = null;
    }
  });
};
