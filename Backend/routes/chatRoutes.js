const express = require("express");
const { requireAuth } = require("../middlewares/requireAuth");
const chatController = require("../controllers/chatController");
const upload = require("../middlewares/upload");

const router = express.Router();

/* =========================
   Conversations
========================= */
router.get("/my-conversations", requireAuth, chatController.getMyConversations);

/* =========================
   Messages (pagination)
========================= */
router.get(
  "/:conversationId/messages",
  requireAuth,
  chatController.getMessages
);

/* =========================
   SEND TEXT MESSAGE
   =========================*/
router.post("/send/text", requireAuth, chatController.sendTextMessage);

/* =========================
   SEND MEDIA MESSAGE
========================= */
router.post(
  "/send/media",
  requireAuth,
  upload.array("files"),
  chatController.sendMediaMessage
);

module.exports = router;
