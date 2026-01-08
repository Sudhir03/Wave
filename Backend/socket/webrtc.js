// =======================
// WebRTC + Presence Handlers
// =======================

// ⚠️ Assume: redis/presence already maintains online users
// Example helper (adjust as per your redis logic)
const { isUserOnline } = require("../redis/presence");
// ↑ agar function ka naam different ho, wahi use karna

module.exports = function registerWebRTCHandlers(io, socket) {
  // =======================
  // CHECK CALLEE ONLINE STATUS
  // =======================
  socket.on("check_user_online", async ({ targetUserId }) => {
    try {
      const online = await isUserOnline(targetUserId);

      console.log(
        `📡 [Presence] Callee ${targetUserId} is`,
        online ? "ONLINE" : "OFFLINE"
      );

      socket.emit("callee_status", {
        userId: targetUserId,
        online,
      });
    } catch (err) {
      console.log("❌ [Presence] Error checking user:", err.message);

      socket.emit("callee_status", {
        userId: targetUserId,
        online: false,
      });
    }
  });

  // =======================
  // WebRTC Signaling (TEST MODE)
  // =======================

  socket.on("webrtc_offer", ({ offer, callType }) => {
    console.log("📞 [WebRTC] Offer received from:", socket.id);
    socket.broadcast.emit("webrtc_offer", { offer, callType });
  });

  socket.on("webrtc_answer", ({ answer }) => {
    console.log("✅ [WebRTC] Answer received from:", socket.id);
    socket.broadcast.emit("webrtc_answer", { answer });
  });

  socket.on("webrtc_ice_candidate", ({ candidate }) => {
    console.log("🧊 [WebRTC] ICE candidate from:", socket.id);
    socket.broadcast.emit("webrtc_ice_candidate", { candidate });
  });

  socket.on("webrtc_call_end", () => {
    console.log("📴 [WebRTC] Call ended by:", socket.id);
    socket.broadcast.emit("webrtc_call_end");
  });

  socket.on("webrtc_call_declined", () => {
    console.log("❌ [WebRTC] Call declined by:", socket.id);
    socket.broadcast.emit("webrtc_call_declined");
  });
};
