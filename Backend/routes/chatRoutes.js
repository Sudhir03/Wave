const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const chatController = require("../controllers/chatController");

const router = express.Router();

// GET: Unified Fetch by Friend ID (New Chat)
router.get(
  "/by-user/:friendId",
  requireAuth,
  chatController.getUnifiedChatData
);

// GET: Unified Fetch by Conversation ID (Existing Chat)
router.get("/:conversationId", requireAuth, chatController.getUnifiedChatData);

router.post("/send", requireAuth, chatController.sendMessage);

// POST: Send message in an existing chat
router.post(
  "/:conversationId/message",
  requireAuth,
  chatController.sendMessage
);

module.exports = router;
