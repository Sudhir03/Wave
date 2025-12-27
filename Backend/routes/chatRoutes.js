const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const chatController = require("../controllers/chatController");

const router = express.Router();

router.get("/my-conversations", requireAuth, chatController.getMyConversations);
router.get(
  "/:conversationId/messages",
  requireAuth,
  chatController.getMessages
);

router.post("/send", requireAuth, chatController.sendMessage);

// POST: Send message in an existing chat
router.post(
  "/:conversationId/message",
  requireAuth,
  chatController.sendMessage
);

module.exports = router;
